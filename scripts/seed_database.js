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
    const subjectsMap = new Map();     // Map: subject_name -> { id, name, code }
    const examSessionsMap = new Map(); // Map: 'session-year' -> { id, session, year }
    const papersToInsert = new Map();  // Map: 'subject_id-exam_session_id-unit_code' -> { ...paper_data... }

    // --- 1. Read and Process All JSON Files ---
    console.log(`\nScanning directory: ${DATA_IMPORT_DIR}`);
    const subjectDirs = fs.readdirSync(DATA_IMPORT_DIR, { withFileTypes: true })
                          .filter(dirent => dirent.isDirectory())
                          .map(dirent => dirent.name);

    if (subjectDirs.length === 0) {
        console.warn(`\n⚠️ No subject directories found in '${DATA_IMPORT_DIR}'. Make sure your data is structured like 'data-import/Physics (2018)/'.`);
        process.exit(0); // Exit gracefully if no data to seed
    }

    for (const subjectDir of subjectDirs) {
      // Extract subject name from directory name (e.g., "Physics (2018)" -> "Physics")
      const subjectNameMatch = subjectDir.match(/^([A-Za-z]+)/);
      const subjectName = subjectNameMatch ? subjectNameMatch[1] : subjectDir;
      const subjectCode = subjectNameMatch ? subjectNameMatch[1].substring(0,3).toUpperCase() : null;

      if (!subjectsMap.has(subjectName)) {
        subjectsMap.set(subjectName, { id: uuidv4(), name: subjectName, code: subjectCode });
        console.log(`\nFound new subject: ${subjectName} (Code: ${subjectCode || 'N/A'})`);
      }
      const currentSubject = subjectsMap.get(subjectName);

      const subjectDirPath = path.join(DATA_IMPORT_DIR, subjectDir);
      const jsonFiles = fs.readdirSync(subjectDirPath).filter(file => file.endsWith('.json'));

      if (jsonFiles.length === 0) {
          console.warn(`  ⚠️ No JSON files found in '${subjectDirPath}'.`);
          continue;
      }

      for (const file of jsonFiles) {
        const filePath = path.join(subjectDirPath, file);
        console.log(`  Processing file: ${file}`);

        let fileContent;
        try {
            fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(fileContent)) {
                console.warn(`    ⚠️ File '${file}' is not a JSON array. Skipping.`);
                continue;
            }
            if (fileContent.length === 0) {
                console.warn(`    ⚠️ File '${file}' is an empty JSON array. Skipping.`);
                continue;
            }
        } catch (parseError) {
            console.error(`    ❌ Error parsing JSON file '${file}': ${parseError.message}. Skipping.`);
            continue;
        }

        // --- Improved filename parsing for session and year ---
        const filenameWithoutExt = file.replace('.json', '');
        let session = '';
        let year = 0;

        // Common patterns: "January-2020", "May-June-2020", "Oct-Nov-2020", "October-November-2020"
        const sessionYearMatch = filenameWithoutExt.match(/^([A-Za-z]+)([-/])([A-Za-z]+)?[-/]?(\d{4})$/);

        if (sessionYearMatch) {
            const part1 = sessionYearMatch[1];
            const separator = sessionYearMatch[2]; // Unused, but shows separator logic
            const part2 = sessionYearMatch[3];
            year = parseInt(sessionYearMatch[4]);

            if (part2) {
                // Handles May-June, Oct-Nov, October-November
                session = `${part1}/${part2}`;
                // Normalize some common variations for consistency in DB
                if (session.toLowerCase() === 'oct/nov') session = 'Oct/Nov';
                if (session.toLowerCase() === 'october/november') session = 'Oct/Nov';
                if (session.toLowerCase() === 'may/june') session = 'May/June';
                // Add more normalizations if your filenames vary (e.g., 'Jan' to 'January')
                if (session.toLowerCase() === 'january' && !sessionYearMatch[3]) session = 'January';
            } else {
                // Handles January
                session = part1;
            }
        } else {
            console.warn(`    ⚠️ Malformed filename format: '${file}'. Expected 'Month-Year.json' or 'Month-Month-Year.json'. Skipping.`);
            continue;
        }

        if (!session || isNaN(year)) {
            console.warn(`    ⚠️ Could not extract valid session or year from filename: '${file}'. Skipping.`);
            continue;
        }
        // --- End of improved filename parsing ---


        const examSessionKey = `${session}-${year}`;
        if (!examSessionsMap.has(examSessionKey)) {
          examSessionsMap.set(examSessionKey, { id: uuidv4(), session, year });
          console.log(`    Found new exam session: ${session} ${year}`);
        }
        const currentExamSession = examSessionsMap.get(examSessionKey);

        for (const item of fileContent) {
          const { Name, Link } = item;
          if (!Name || !Link) {
              console.warn(`      ⚠️ Skipping entry due to missing 'Name' or 'Link' in JSON: ${JSON.stringify(item)}`);
              continue;
          }

          let materialType = null;
          // More robust checks for material type names
          if (Name.includes('Question paper') || Name.includes('QP')) materialType = 'question_paper_link';
          else if (Name.includes('Mark scheme') || Name.includes('MS')) materialType = 'mark_scheme_link';
          else if (Name.includes('Examiner report') || Name.includes('ER')) materialType = 'examiner_report_link';
          else {
            console.warn(`      ⚠️ Unknown material type in name: '${Name}'. Skipping entry.`);
            continue;
          }

          // Extract unit code (e.g., WPH11, WMA01)
          // Look for patterns like (WXYZNN) or (WXYZNN/01) and capture just WXYZNN
          const unitCodeMatch = Name.match(/\((W[A-Z0-9]+)(?:\/[0-9]+)?\)/);
          if (!unitCodeMatch || !unitCodeMatch[1]) {
            console.warn(`      ⚠️ Could not find unit code in name: '${Name}'. Skipping entry.`);
            continue;
          }
          const unitCode = unitCodeMatch[1]; // Capture only the base code (e.g., WPH11)

          const paperKey = `${currentSubject.id}-${currentExamSession.id}-${unitCode}`;

          if (!papersToInsert.has(paperKey)) {
            // Initialize paper entry if it's new
            papersToInsert.set(paperKey, {
              id: uuidv4(),
              subject_id: currentSubject.id,
              exam_session_id: currentExamSession.id,
              unit_code: unitCode,
              question_paper_link: null,
              mark_scheme_link: null,
              examiner_report_link: null,
            });
          }

          // Add the link to the corresponding type for this paper entry
          const paperEntry = papersToInsert.get(paperKey);
          if (paperEntry[materialType] && paperEntry[materialType] !== Link) {
              console.warn(`      ⚠️ Duplicate link type found for ${unitCode} - ${materialType} in ${file}. Overwriting old link.`);
          }
          paperEntry[materialType] = Link;
          papersToInsert.set(paperKey, paperEntry); // Update the map
        }
      }
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`✅ Finished processing all JSON files.`);
    console.log(`Found ${subjectsMap.size} unique subjects.`);
    console.log(`Found ${examSessionsMap.size} unique exam sessions.`);
    console.log(`Found ${papersToInsert.size} unique paper units to insert/update.`);

    // --- 2. Insert Data into Supabase ---

    // Insert Subjects
    console.log('\n⏳ Inserting subjects...');
    const { error: subjectsError } = await supabase.from('subjects').insert(Array.from(subjectsMap.values()), { onConflict: 'name' });
    if (subjectsError) {
        if (subjectsError.code === '23505') { // 23505 is unique violation error code
            console.warn('  Subjects already exist, skipping insertion (onConflict handled).');
        } else {
            console.error('  ❌ Error inserting subjects:', subjectsError.message);
            throw subjectsError; // Re-throw to stop if a non-conflict error occurs
        }
    }
    console.log('  ✅ Subjects insertion attempted.');


    // Insert Exam Sessions
    console.log('\n⏳ Inserting exam sessions...');
    const { error: examsError } = await supabase.from('exam_sessions').insert(Array.from(examSessionsMap.values()), { onConflict: 'session,year' });
    if (examsError) {
        if (examsError.code === '23505') {
            console.warn('  Exam sessions already exist, skipping insertion (onConflict handled).');
        } else {
            console.error('  ❌ Error inserting exam sessions:', examsError.message);
            throw examsError;
        }
    }
    console.log('  ✅ Exam sessions insertion attempted.');


    // Insert Papers (this will be the largest table, so use batching)
    console.log(`\n⏳ Inserting ${papersToInsert.size} papers in batches of ${BATCH_SIZE}...`);
    const papersArray = Array.from(papersToInsert.values());
    if (papersArray.length === 0) {
        console.log('  No papers to insert.');
    } else {
        for (let i = 0; i < papersArray.length; i += BATCH_SIZE) {
          const batch = papersArray.slice(i, i + BATCH_SIZE);
          console.log(`  Inserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(papersArray.length / BATCH_SIZE)} (${batch.length} records)...`);
          const { error: papersError } = await supabase.from('papers').insert(batch, { onConflict: 'subject_id,exam_session_id,unit_code' });
          if (papersError) {
              if (papersError.code === '23505') {
                  console.warn(`    ⚠️ Batch ${Math.floor(i / BATCH_SIZE) + 1} contains existing papers, skipping conflicts.`);
              } else {
                  console.error(`    ❌ Error inserting papers batch ${Math.floor(i / BATCH_SIZE) + 1}:`, papersError.message);
                  throw papersError; // Stop on critical errors
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
    process.exit(1); // Exit with error code
  }
}

seedDatabase();