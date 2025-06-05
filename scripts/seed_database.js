// Use 'require' for dependencies
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating UUIDs
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
    // subjectsMap now stores only a placeholder/intermediate value to derive unique_key later
    const tempSubjectsMap = new Map();     // Map: 'subject_name-syllabus_type' -> { name, code, syllabus_type }
    const examSessionsMap = new Map(); // Map: 'session-year' -> { id, session, year }
    const papersToInsert = new Map();  // Map: 'subject_unique_key-exam_session_id-unit_code' -> { ...paper_data, subject_unique_key }

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
        console.log(`\nProcessing syllabus type: ${syllabusType}`);

        const subjectDirs = fs.readdirSync(syllabusTypePath, { withFileTypes: true })
                              .filter(dirent => dirent.isDirectory())
                              .map(dirent => dirent.name);

        if (subjectDirs.length === 0) {
            console.warn(`  ⚠️ No subject directories found in '${syllabusTypePath}'. Skipping.`);
            continue;
        }

        for (const subjectDir of subjectDirs) {
          // Extract subject name (e.g., 'Physics') and code (e.g., 'PHY') from directory name
          // The regex now tries to capture the subject name before any year or parenthesis.
          const subjectNameMatch = subjectDir.match(/^([A-Za-z]+)\s*(?:\(\d{4}\))?/);
          const subjectName = subjectNameMatch ? subjectNameMatch[1] : subjectDir;
          const subjectCode = subjectNameMatch ? subjectNameMatch[1].substring(0,3).toUpperCase() : null;

          const subjectUniqueKey = `${subjectName}-${syllabusType}`; // This will be the key for lookup later
          if (!tempSubjectsMap.has(subjectUniqueKey)) {
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
            console.log(`    Processing file: ${file}`);

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
            let session = '';
            let year = 0;

            const sessionYearMatch = filenameWithoutExt.match(/^([A-Za-z]+)(?:[/\-]([A-Za-z]+))?[-/](\d{4})$/);

            if (sessionYearMatch) {
                const part1 = sessionYearMatch[1];
                const part2 = sessionYearMatch[2]; // This will be undefined for "January-2020"

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

            } else {
                console.warn(`      ⚠️ Malformed filename format: '${file}'. Expected 'Month-Year.json' or 'Month-Month-Year.json'. Skipping.`);
                continue;
            }

            if (!session || isNaN(year)) {
                console.warn(`      ⚠️ Could not extract valid session or year from filename: '${file}'. Skipping.`);
                continue;
            }

            const examSessionKey = `${session}-${year}`;
            if (!examSessionsMap.has(examSessionKey)) {
              examSessionsMap.set(examSessionKey, { id: uuidv4(), session, year }); // Still use UUID for temp key in map
              console.log(`      Found new exam session: ${session} ${year}`);
            }
            const currentExamSessionTempId = examSessionsMap.get(examSessionKey).id;


            for (const item of fileContent) {
              const { Name, Link } = item;
              if (!Name || !Link) {
                  console.warn(`        ⚠️ Skipping entry due to missing 'Name' or 'Link' in JSON: ${JSON.stringify(item)}`);
                  continue;
              }

              let materialType = null;
              const lowerCaseName = Name.toLowerCase(); // Convert to lowercase for robust matching

              if (lowerCaseName.includes('question paper') || lowerCaseName.includes('qp')) materialType = 'question_paper_link';
              else if (lowerCaseName.includes('mark scheme') || lowerCaseName.includes('ms')) materialType = 'mark_scheme_link';
              else if (lowerCaseName.includes('examiner report') || lowerCaseName.includes('er')) materialType = 'examiner_report_link';
              else if (lowerCaseName.includes('provisional mark scheme')) materialType = 'mark_scheme_link'; // Also treat provisional as mark scheme
              else {
                console.warn(`        ⚠️ Unknown material type in name: '${Name}'. Skipping entry.`);
                continue;
              }

              // ADJUSTED: Unit code extraction for IGCSE papers (e.g., "1P", "1PR", "2P", "2PR")
              const unitCodeMatch = Name.match(/Paper\s(1P|1PR|2P|2PR|PR)/i); // Case-insensitive match for "Paper X"
              let unitCode = null;
              if (unitCodeMatch && unitCodeMatch[1]) {
                  unitCode = unitCodeMatch[1].toUpperCase();
                  // Special handling for 'PR' if it consistently maps to '2PR' in the links for IGCSE
                  if (unitCode === 'PR' && syllabusType === 'IGCSE') {
                      unitCode = '2PR';
                  }
              }

              if (!unitCode) {
                // FALLBACK for cases where the specific "Paper X" format isn't found
                // If it's an IAL-style code like (WPH01), try that too.
                const ialUnitCodeMatch = Name.match(/\((W[A-Z0-9]+)(?:\/[0-9]+)?\)/);
                if (ialUnitCodeMatch && ialUnitCodeMatch[1]) {
                    unitCode = ialUnitCodeMatch[1];
                } else {
                    console.warn(`        ⚠️ Could not find a recognized unit code (e.g., 'Paper 1P' or '(WPH01)') in name: '${Name}'. Skipping entry.`);
                    continue;
                }
              }

              // Key for papersToInsert now uses the subject's unique key derived from name/syllabus_type
              // and the temp exam session ID. The final subject_id will be resolved later.
              const paperKey = `${subjectUniqueKey}-${currentExamSessionTempId}-${unitCode}`;

              if (!papersToInsert.has(paperKey)) {
                papersToInsert.set(paperKey, {
                  id: uuidv4(), // Generate a UUID for the paper itself
                  subject_unique_key: subjectUniqueKey, // Store this to lookup the final subject_id later
                  exam_session_temp_id: currentExamSessionTempId, // Store this to lookup the final exam_session_id later
                  unit_code: unitCode,
                  question_paper_link: null,
                  mark_scheme_link: null,
                  examiner_report_link: null,
                });
              }

              const paperEntry = papersToInsert.get(paperKey);
              if (paperEntry[materialType] && paperEntry[materialType] !== Link) {
                  // This is a warning, not an error, as sometimes there might be slight variations
                  // or provisional vs final versions. The script will simply overwrite.
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
    // Use select: 'id,name,syllabus_type' to get back the actual IDs from the DB
    const { data: upsertedSubjects, error: subjectsError } = await supabase
        .from('subjects')
        .upsert(subjectsToUpsert, { onConflict: 'name,syllabus_type' })
        .select('id, name, syllabus_type'); // Crucial: Select the ID and identifying columns

    if (subjectsError) {
        console.error('  ❌ Error inserting subjects:', subjectsError.message);
        throw subjectsError;
    }

    // Populate finalSubjectsMap with actual DB IDs
    upsertedSubjects.forEach(subject => {
        finalSubjectsMap.set(`${subject.name}-${subject.syllabus_type}`, subject.id);
    });
    console.log('  ✅ Subjects insertion/upsertion complete. Fetched actual IDs.');

    // Insert Exam Sessions
    console.log('\n⏳ Inserting/Upserting exam sessions...');
    const examSessionsToUpsert = Array.from(examSessionsMap.values());
    const { data: upsertedExamSessions, error: examsError } = await supabase
        .from('exam_sessions')
        .upsert(examSessionsToUpsert, { onConflict: 'session,year' })
        .select('id, session, year'); // Crucial: Select the ID and identifying columns

    if (examsError) {
        console.error('  ❌ Error inserting exam sessions:', examsError.message);
        throw examsError;
    }

    // Populate finalExamSessionsMap with actual DB IDs
    upsertedExamSessions.forEach(session => {
        finalExamSessionsMap.set(`${session.session}-${session.year}`, session.id);
    });
    console.log('  ✅ Exam sessions insertion/upsertion complete. Fetched actual IDs.');


    // Prepare Papers for Insertion using actual DB IDs
    console.log(`\n⏳ Preparing ${papersToInsert.size} papers with actual subject and session IDs...`);
    const finalPapersToInsert = [];
    for (const [paperKey, paperData] of papersToInsert.entries()) {
        const actualSubjectId = finalSubjectsMap.get(paperData.subject_unique_key);
        // Find the actual session ID based on the original session and year data
        const originalSessionData = Array.from(examSessionsMap.values())
            .find(es => es.id === paperData.exam_session_temp_id); // Find by temp ID
        const actualExamSessionId = originalSessionData
            ? finalExamSessionsMap.get(`${originalSessionData.session}-${originalSessionData.year}`)
            : null;

        if (!actualSubjectId) {
            console.warn(`    ⚠️ Could not find actual subject ID for ${paperData.subject_unique_key}. Skipping paper ${paperData.unit_code}.`);
            continue;
        }
        if (!actualExamSessionId) {
            console.warn(`    ⚠️ Could not find actual exam session ID for temp ID ${paperData.exam_session_temp_id}. Skipping paper ${paperData.unit_code}.`);
            continue;
        }

        finalPapersToInsert.push({
            id: paperData.id, // Keep the original UUID for the paper record itself
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