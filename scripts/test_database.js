// Load environment variables from .env file
require('dotenv').config();

// Use 'require' for dependencies
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline'); // For interactive CLI input

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Readline Interface for CLI Input ---
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// --- Helper Functions to Query Tables ---

/**
 * Fetches and displays all subjects.
 */
async function listSubjects() {
  console.log('\n--- Listing Subjects ---');
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching subjects:', error.message);
  } else if (data.length === 0) {
    console.log('No subjects found.');
  } else {
    data.forEach(subject => {
      console.log(`ID: ${subject.id}\n  Name: ${subject.name}\n  Code: ${subject.code || 'N/A'}`);
    });
    console.log(`Total subjects: ${data.length}`);
  }
}

/**
 * Fetches and displays all exam sessions.
 */
async function listExamSessions() {
  console.log('\n--- Listing Exam Sessions ---');
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('id, session, year')
    .order('year', { ascending: false })
    .order('session', { ascending: true }); // Order by month (alphabetically for Jan, June, Oct)

  if (error) {
    console.error('Error fetching exam sessions:', error.message);
  } else if (data.length === 0) {
    console.log('No exam sessions found.');
  } else {
    data.forEach(session => {
      console.log(`ID: ${session.id}\n  Session: ${session.session} ${session.year}`);
    });
    console.log(`Total exam sessions: ${data.length}`);
  }
}

/**
 * Fetches and displays papers based on subject name, session, and year, showing full URLs.
 * Allows partial matching for subject name and session.
 */
async function listPapersByCriteria() {
  console.log('\n--- Listing Papers by Criteria (with URLs) ---');

  rl.question('Enter Subject Name (e.g., "Physics", leave empty for all): ', async (subjectInput) => {
    rl.question('Enter Session (e.g., "January", "June", "Oct/Nov", leave empty for all): ', async (sessionInput) => {
      rl.question('Enter Year (e.g., "2020", leave empty for all): ', async (yearInput) => {

        let query = supabase.from('papers').select(`
          id,
          unit_code,
          question_paper_link,
          mark_scheme_link,
          examiner_report_link,
          subjects ( name, code ),
          exam_sessions ( session, year )
        `).limit(20); // Limit to 20 for brevity, remove for all if needed

        if (subjectInput) {
          // Find subject ID
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id')
            .ilike('name', `%${subjectInput}%`) // Case-insensitive partial match
            .single();

          if (subjectError || !subjectData) {
            console.error(`Could not find subject matching "${subjectInput}". Error: ${subjectError?.message || 'No subject found.'}`);
            rl.close();
            return;
          }
          query = query.eq('subject_id', subjectData.id);
        }

        if (sessionInput || yearInput) {
          // Find exam session ID(s)
          let examSessionQuery = supabase.from('exam_sessions').select('id');
          if (sessionInput) {
            examSessionQuery = examSessionQuery.ilike('session', `%${sessionInput}%`); // Case-insensitive partial match
          }
          if (yearInput) {
            const parsedYear = parseInt(yearInput);
            if (!isNaN(parsedYear)) {
              examSessionQuery = examSessionQuery.eq('year', parsedYear);
            } else {
              console.warn('Invalid year input, ignoring year filter.');
            }
          }

          const { data: examSessionData, error: examSessionError } = await examSessionQuery;

          if (examSessionError || !examSessionData || examSessionData.length === 0) {
            console.error(`Could not find exam session matching criteria. Error: ${examSessionError?.message || 'No exam sessions found.'}`);
            rl.close();
            return;
          }

          const examSessionIds = examSessionData.map(s => s.id);
          query = query.in('exam_session_id', examSessionIds);
        }

        query = query.order('unit_code', { ascending: true }); // Order papers by unit

        const { data: papers, error: papersError } = await query;

        if (papersError) {
          console.error('Error fetching papers:', papersError.message);
        } else if (papers.length === 0) {
          console.log('No papers found matching your criteria.');
        } else {
          papers.forEach(paper => {
            console.log(`\nPaper ID: ${paper.id}`);
            console.log(`  Subject: ${paper.subjects?.name || 'N/A'} (Unit: ${paper.unit_code})`);
            console.log(`  Session: ${paper.exam_sessions?.session || 'N/A'} ${paper.exam_sessions?.year || 'N/A'}`);
            // --- MODIFIED LINES TO SHOW FULL URLS ---
            console.log(`  Question Paper URL: ${paper.question_paper_link || 'N/A'}`);
            console.log(`  Mark Scheme URL:    ${paper.mark_scheme_link || 'N/A'}`);
            console.log(`  Examiner Report URL: ${paper.examiner_report_link || 'N/A'}`);
            // -----------------------------------------
          });
          console.log(`\nTotal papers found: ${papers.length}`);
          if (papers.length >= 20) {
            console.log('(Note: Results are limited to 20. Modify script to fetch more.)');
          }
        }
        rl.close(); // Close readline after completing query
      });
    });
  });
}

// --- Main Menu / Execution Logic ---
async function main() {
  console.log('--- Supabase DB Test CLI ---');
  console.log('1. List all Subjects');
  console.log('2. List all Exam Sessions');
  console.log('3. Find Papers by Subject/Session/Year (Interactive)');
  console.log('4. Exit');

  rl.question('Choose an option: ', async (answer) => {
    switch (answer.trim()) {
      case '1':
        await listSubjects();
        rl.close(); // Close after showing results
        break;
      case '2':
        await listExamSessions();
        rl.close(); // Close after showing results
        break;
      case '3':
        await listPapersByCriteria(); // This function will close rl internally
        break;
      case '4':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid option. Please try again.');
        rl.close(); // Close on invalid input
        break;
    }
  });
}

main();