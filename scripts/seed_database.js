// Use 'require' for dependencies
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs - no longer used for existing records' IDs
require('dotenv').config(); // Load environment variables from .env file

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service_role key for seeding

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('⚠️ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables.');
  process.exit(1);
}

// Initialize Supabase client with the service_role key.
// This client bypasses RLS policies, allowing inserts even if RLS is enabled.
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false // No need to persist session for a one-off script
  }
});

// --- Configuration ---
const DATA_IMPORT_DIR = './data-import'; // Root directory for your JSON files
const BATCH_SIZE = 500; // Number of records to insert in one go for 'papers' table

async function seedDatabase() {
  console.log('🚀 Starting database seeding process...');

  try {
    // --- Data Storage for De-duplication and ID Management ---
    // tempSubjectsMap will store { name, code, syllabus_type }
    const tempSubjectsMap = new Map();     // Map: 'subject_name-syllabus_type' -> { name, code, syllabus_type }
    // examSessionsMap will store { session, year }
    const examSessionsMap = new Map(); // Map: 'session-year' -> { session, year }
    // papersToInsert will store data without temporary IDs, using unique keys for lookup
    const papersToInsert = new Map();  // Map: 'subject_unique_key-exam_session_key-unit_code' -> { ...paper_data, subject_unique_key, exam_session_key }

    // --- To store final IDs after upserting ---
    const finalSubjectsMap = new Map(); // Map: 'name-syllabus_type' -> actual_db_id
    const finalExamSessionsMap = new Map(); // Map: 'session-year' -> actual_db_id

    // --- 1. Read and Process All JSON Files ---
    console.log(`\nScanning directory: ${DATA_IMPORT_DIR}`);

    const syllabusTypeDirs = fs.readdirSync(DATA_IMPORT_DIR, { withFileTypes: true })
                               .filter(dirent => dirent.isDirectory())
                               .map(dirent => dirent.name);

    if (syllabusTypeDirs.length === 0) {
        console.warn(`\n⚠️ No syllabus type directories found in '${DATA_IMPORT_DIR}'. Make sure your data is structured like 'data-import/IAL/Physics (2018)/'.`);
        process.exit(0);
    }

    for (const syllabusType of syllabusTypeDirs) {
        const syllabusTypePath = path.join(DATA_IMPORT_DIR, syllabusType);
        console.log(`\nProcessing syllabus type directory: ${syllabusType}`); // Confirms syllabusType
        // Add specific log for IGCSE directory detection
        if (syllabusType === 'IGCSE') {
            console.log(`----> CONFIRMED: Entering IGCSE syllabus type block.`);
        }

        const subjectDirs = fs.readdirSync(syllabusTypePath, { withFileTypes: true })
                              .filter(dirent => dirent.isDirectory())
                              .map(dirent => dirent.name);

        if (subjectDirs.length === 0) {
            console.warn(`  ⚠️ No subject directories found in '${syllabusTypePath}'. Skipping.`);
            continue;
        }

        for (const subjectDir of subjectDirs) {
          const subjectNameMatch = subjectDir.match(/^([A-Za-z]+)\s*(?:\(\d{4}\))?/);
          const subjectName = subjectNameMatch ? subjectNameMatch[1] : subjectDir;
          const subjectCode = subjectNameMatch ? subjectNameMatch[1].substring(0,3).toUpperCase() : null;

          const subjectUniqueKey = `${subjectName}-${syllabusType}`;
          if (!tempSubjectsMap.has(subjectUniqueKey)) {
            // Store subject data without a temporary ID; Supabase will manage it.
            tempSubjectsMap.set(subjectUniqueKey, { name: subjectName, code: subjectCode, syllabus_type: syllabusType });
            console.log(`  Found new subject: ${subjectName} (Code: ${subjectCode || 'N/A'}, Type: ${syllabusType})`);
          }

          const subjectDirPath = path.join(syllabusTypePath, subjectDir);
          const jsonFiles = fs.readdirSync(subjectDirPath).filter(file => file.endsWith('.json'));

          if (jsonFiles.length === 0) {
              console.warn(`    ⚠️ No JSON files found in '${subjectDirPath}'.`);
              continue;
          }

          for (const file of jsonFiles) {
            const filePath = path.join(subjectDirPath, file);
            console.log(`    Attempting to process file: ${filePath}`);

            let fileContent;
            try {
                fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (!Array.isArray(fileContent)) {
                    console.warn(`      ⚠️ File '${file}' is not a JSON array. Skipping.`);
                    continue;
                }
                if (fileContent.length === 0) {
                    console.warn(`      ⚠️ File '${file}' is an empty JSON array. Skipping.`);
                    continue;
                }
            } catch (parseError) {
                console.error(`      ❌ Error parsing JSON file '${file}': ${parseError.message}. Skipping.`);
                continue;
            }

            const filenameWithoutExt = file.replace('.json', '');
            console.log(`      Filename without extension for '${file}': '${filenameWithoutExt}'`);

            let session = '';
            let year = 0;

            const sessionYearMatch = filenameWithoutExt.match(/^([A-Za-z]+)(?:[/\-]([A-Za-z]+))?[-/](\d{4})$/);
            console.log(`      Regex match result for '${filenameWithoutExt}':`, sessionYearMatch);

            if (sessionYearMatch) {
                const part1 = sessionYearMatch[1];
                const part2 = sessionYearMatch[2];

                year = parseInt(sessionYearMatch[3]);

                if (part2) {
                    session = `${part1}/${part2}`;
                } else {
                    session = part1;
                }

                // Normalize session names
                if (session.toLowerCase().includes('jan')) session = 'January';
                else if (session.toLowerCase().includes('june') || session.toLowerCase().includes('may')) session = 'May/June';
                else if (session.toLowerCase().includes('oct') || session.toLowerCase().includes('nov')) session = 'Oct/Nov';

                console.log(`      Extracted Session: '${session}', Year: ${year} for file: '${file}'`);

            } else {
                console.warn(`      ⚠️ Malformed filename format: '${file}'. Expected 'Month-Year.json' or 'Month-Month-Year.json'. Skipping.`);
                continue;
            }

            if (!session || isNaN(year)) {
                console.warn(`      ⚠️ Could not extract valid session or year from filename: '${file}'. Session: '${session}', Year: ${year}. Skipping.`);
                continue;
            }

            const examSessionKey = `${session}-${year}`;
            if (!examSessionsMap.has(examSessionKey)) {
              // Store exam session data without a temporary ID; Supabase will manage it.
              examSessionsMap.set(examSessionKey, { session, year });
              console.log(`      Found new exam session: ${session} ${year}`);
            }
            // We no longer need a 'currentExamSessionTempId' as we'll resolve actual IDs later.


            for (const item of fileContent) {
              const { Name, Link } = item;
              if (!Name || !Link) {
                  console.warn(`        ⚠️ Skipping entry due to missing 'Name' or 'Link' in JSON: ${JSON.stringify(item)} from file '${file}'`);
                  continue;
              }

              let materialType = null;
              const lowerCaseName = Name.toLowerCase();

              // Skip "Unused" entries
              if (lowerCaseName.includes('unused')) {
                  console.log(`        Skipping 'Unused' entry: '${Name}' from file '${file}'.`);
                  continue;
              }

              if (lowerCaseName.includes('question paper') || lowerCaseName.includes('qp')) materialType = 'question_paper_link';
              else if (lowerCaseName.includes('mark scheme') || lowerCaseName.includes('ms')) materialType = 'mark_scheme_link';
              else if (lowerCaseName.includes('examiner report') || lowerCaseName.includes('er')) materialType = 'examiner_report_link';
              else if (lowerCaseName.includes('provisional mark scheme')) materialType = 'mark_scheme_link';
              else {
                console.warn(`        ⚠️ Unknown material type in name: '${Name}' from file '${file}'. Skipping entry.`);
                continue;
              }

              let unitCode = null;

              // --- Detailed Unit Code Extraction Logic with Logs ---
              console.log(`        Processing item: '${Name}' for unit code extraction.`);
              console.log(`        Current syllabusType: '${syllabusType}'`);


              // Attempt IAL-style codes first if syllabusType is IAL
              if (syllabusType === 'IAL') {
                  const ialUnitCodeMatch = Name.match(/\((W[A-Z0-9]+)(?:\/[0-9]+)?\)/);
                  console.log(`        IAL regex match result:`, ialUnitCodeMatch);
                  if (ialUnitCodeMatch && ialUnitCodeMatch[1]) {
                      unitCode = ialUnitCodeMatch[1];
                      console.log(`        IAL unit code found: '${unitCode}'`);
                  }
              }

              // Attempt IGCSE-style codes if unitCode not found yet AND syllabusType is IGCSE
              if (!unitCode && syllabusType === 'IGCSE') {
                  console.log(`        Attempting IGCSE unit code match for '${Name}' (lowerCaseName: '${lowerCaseName}')`);
                  // Using word boundaries (\b) to ensure exact matches for '1P', '1PR', etc.
                  const igcseUnitCodeMatch = lowerCaseName.match(/paper\s*(\b(?:1p|1pr|2p|2pr|pr|1c|1cr|2c|2cr|1b|1br|2b|2br|1|1r|2|2r|01|02)\b)/);
                  console.log(`        IGCSE regex match result:`, igcseUnitCodeMatch);

                  if (igcseUnitCodeMatch && igcseUnitCodeMatch[1]) {
                      unitCode = igcseUnitCodeMatch[1].toUpperCase();
                      console.log(`        IGCSE raw unit code matched: '${igcseUnitCodeMatch[1]}'`);

                      // Special handling for 'PR' to consistently map to '2PR' for IGCSE
                      if (unitCode === 'PR') {
                          unitCode = '2PR';
                          console.log(`        Normalized 'PR' to '2PR'. Final unit code: '${unitCode}'`);
                      } else {
                          console.log(`        Final IGCSE unit code: '${unitCode}'`);
                      }
                  }
              }

              if (!unitCode) {
                console.warn(`        ⚠️ Could not find a recognized unit code in name: '${Name}' from file '${file}'. Skipping entry.`);
                continue; // Skip if no unit code is found
              }
              // --- End Detailed Unit Code Extraction Logic with Logs ---

              // Use examSessionKey directly for paperKey, as actual IDs are resolved later
              const paperKey = `${subjectUniqueKey}-${examSessionKey}-${unitCode}`;

              if (!papersToInsert.has(paperKey)) {
                papersToInsert.set(paperKey, {
                  // No 'id' here; let Supabase generate it on insert
                  subject_unique_key: subjectUniqueKey, // Store the unique key to resolve actual ID later
                  exam_session_key: examSessionKey,     // Store the key to resolve actual ID later
                  unit_code: unitCode,
                  question_paper_link: null,
                  mark_scheme_link: null,
                  examiner_report_link: null,
                });
              }

              const paperEntry = papersToInsert.get(paperKey);
              if (paperEntry[materialType] && paperEntry[materialType] !== Link) {
                  console.warn(`        ⚠️ Duplicate link type found for ${unitCode} - ${materialType} in ${file}. Overwriting old link.`);
              }
              paperEntry[materialType] = Link;
              papersToInsert.set(paperKey, paperEntry);
            }
          }
        }
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`✅ Finished processing all JSON files.`);
    console.log(`Found ${tempSubjectsMap.size} unique subjects (by name+type).`);
    console.log(`Found ${examSessionsMap.size} unique exam sessions.`);
    console.log(`Found ${papersToInsert.size} unique paper units to insert/update.`);

    // --- 2. Insert Data into Supabase and Fetch Actual IDs ---

    // Insert Subjects
    console.log('\n⏳ Inserting/Upserting subjects...');
    const subjectsToUpsert = Array.from(tempSubjectsMap.values());
    // The `upsert` method with `onConflict` handles checking for existing subjects.
    // If a subject with the same 'name' and 'syllabus_type' exists, it will not create a new one,
    // but rather return the ID of the existing subject. If it doesn't exist, it inserts it.
    // By not providing an 'id' in the upsert data, Supabase will manage the primary key.
    const { data: upsertedSubjects, error: subjectsError } = await supabase
        .from('subjects')
        .upsert(subjectsToUpsert, { onConflict: 'name,syllabus_type' })
        .select('id, name, syllabus_type');

    if (subjectsError) {
        console.error('  ❌ Error inserting subjects:', subjectsError.message);
        throw subjectsError;
    }

    upsertedSubjects.forEach(subject => {
        finalSubjectsMap.set(`${subject.name}-${subject.syllabus_type}`, subject.id);
    });
    console.log('  ✅ Subjects insertion/upsertion complete. Fetched actual IDs.');

    // Insert Exam Sessions
    console.log('\n⏳ Inserting/Upserting exam sessions...');
    const examSessionsToUpsert = Array.from(examSessionsMap.values());
    // Similar to subjects, let Supabase manage the 'id' for exam sessions.
    const { data: upsertedExamSessions, error: examsError } = await supabase
        .from('exam_sessions')
        .upsert(examSessionsToUpsert, { onConflict: 'session,year' })
        .select('id, session, year');

    if (examsError) {
        console.error('  ❌ Error inserting exam sessions:', examsError.message);
        throw examsError;
    }

    upsertedExamSessions.forEach(session => {
        finalExamSessionsMap.set(`${session.session}-${session.year}`, session.id);
    });
    console.log('  ✅ Exam sessions insertion/upsertion complete. Fetched actual IDs.');

    // Prepare Papers for Insertion using actual DB IDs
    console.log(`\n⏳ Preparing ${papersToInsert.size} papers with actual subject and session IDs...`);
    const finalPapersToInsert = [];
    for (const [paperKey, paperData] of papersToInsert.entries()) {
        const actualSubjectId = finalSubjectsMap.get(paperData.subject_unique_key);
        // Resolve actual exam session ID using the stored exam_session_key
        const actualExamSessionId = finalExamSessionsMap.get(paperData.exam_session_key);

        if (!actualSubjectId) {
            console.warn(`    ⚠️ Could not find actual subject ID for ${paperData.subject_unique_key}. Skipping paper ${paperData.unit_code}.`);
            continue;
        }
        if (!actualExamSessionId) {
            console.warn(`    ⚠️ Could not find actual exam session ID for key ${paperData.exam_session_key}. Skipping paper ${paperData.unit_code}.`);
            continue;
        }

        finalPapersToInsert.push({
            // No 'id' here; let Supabase generate it on insert
            subject_id: actualSubjectId,
            exam_session_id: actualExamSessionId,
            unit_code: paperData.unit_code,
            question_paper_link: paperData.question_paper_link,
            mark_scheme_link: paperData.mark_scheme_link,
            examiner_report_link: paperData.examiner_report_link,
        });
    }
    console.log(`  Prepared ${finalPapersToInsert.length} papers for insertion.`);

    // Insert Papers (this will be the largest table, so use batching)
    console.log(`\n⏳ Inserting ${finalPapersToInsert.length} papers in batches of ${BATCH_SIZE}...`);
    if (finalPapersToInsert.length === 0) {
        console.log('  No papers to insert.');
    } else {
        for (let i = 0; i < finalPapersToInsert.length; i += BATCH_SIZE) {
          const batch = finalPapersToInsert.slice(i, i + BATCH_SIZE);
          console.log(`  Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(finalPapersToInsert.length / BATCH_SIZE)} (${batch.length} records)...`);
          // Upsert papers on the unique combination of subject_id, exam_session_id, and unit_code
          const { error: papersError } = await supabase.from('papers').upsert(batch, { onConflict: 'subject_id,exam_session_id,unit_code' });
          if (papersError) {
              if (papersError.code === '23505') {
                  console.warn(`    ⚠️ Batch ${Math.floor(i / BATCH_SIZE) + 1} contains existing papers, skipping conflicts.`);
              } else {
                  console.error(`    ❌ Error inserting papers batch ${Math.floor(i / BATCH_SIZE) + 1}:`, papersError.message);
                  throw papersError;
              }
          }
        }
    }
    console.log('  ✅ Papers insertion complete.');

    console.log('\n🎉 Database seeding finished successfully!');

  } catch (error) {
    console.error('\n❌ An unhandled error occurred during seeding:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  }
}

seedDatabase();
