// Load env
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function main() {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (e) {
    console.error('Missing dependency: mysql2');
    console.error('Install it with: npm i mysql2');
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));

  // Config
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const database = process.env.MYSQL_DATABASE || 'eduvance_db';
  const user = process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root';
  let password = process.env.MYSQL_PASSWORD;

  const DATA_IMPORT_DIR = './data-import';
  const BATCH_SIZE = 500;

  if (!password) {
    password = await ask('Enter MySQL password: ');
  }

  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);

    // Ensure unique index for papers upsert equivalence
    await connection.query(
      `CREATE TABLE IF NOT EXISTS papers (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        subject_id CHAR(36) NOT NULL,
        exam_session_id CHAR(36) NOT NULL,
        unit_code VARCHAR(100) NOT NULL,
        question_paper_link TEXT,
        mark_scheme_link TEXT,
        examiner_report_link TEXT,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`
    );
    await connection.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_papers_unique ON papers (subject_id, exam_session_id, unit_code)'
    ).catch(async (e) => {
      if (e && e.code === 'ER_PARSE_ERROR') {
        // MySQL < 8.0 has no IF NOT EXISTS for indexes; try create and ignore duplicate
        try {
          await connection.query('CREATE UNIQUE INDEX idx_papers_unique ON papers (subject_id, exam_session_id, unit_code)');
        } catch (e2) {
          // ignore if already exists (errno 1061)
          if (e2 && e2.errno !== 1061) throw e2;
        }
      } else if (e && e.errno !== 1061) {
        throw e;
      }
    });

    // Fetch subjects from DB
    const [subjects] = await connection.query('SELECT id, name, code, syllabus_type FROM subjects');
    if (!subjects || subjects.length === 0) {
      console.log('❌ No subjects found in database. Please add subjects first.');
      rl.close();
      return;
    }

    // Scan available subjects in filesystem
    function toKebabCase(str) { return str.toLowerCase().replace(/\s+/g, '-'); }

    const availableSubjects = new Map(); // key: name-type -> { name, syllabus_type, dir, count }
    if (fs.existsSync(DATA_IMPORT_DIR)) {
      const typeDirs = fs.readdirSync(DATA_IMPORT_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
      for (const type of typeDirs) {
        const typePath = path.join(DATA_IMPORT_DIR, type);
        const subjectDirs = fs.readdirSync(typePath, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
        for (const subjectDir of subjectDirs) {
          const match = subjectDir.match(/^(.+?)\s*\(\d{4}\)$/);
          const subjectName = match ? match[1].trim() : subjectDir;
          const dirPath = path.join(typePath, subjectDir);
          const jsonFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
          if (jsonFiles.length > 0) {
            availableSubjects.set(`${subjectName}-${type}`, {
              name: subjectName,
              syllabus_type: type,
              directory_path: dirPath,
              json_files: jsonFiles
            });
          }
        }
      }
    }

    // Match DB subjects with available data
    const matches = [];
    for (const subj of subjects) {
      const key = `${subj.name}-${subj.syllabus_type}`;
      if (availableSubjects.has(key)) {
        const info = availableSubjects.get(key);
        matches.push({
          id: subj.id,
          name: subj.name,
          code: subj.code,
          syllabus_type: subj.syllabus_type,
          directory_path: info.directory_path,
          json_files: info.json_files
        });
      }
    }

    if (matches.length === 0) {
      console.log('❌ No matching subjects found between database and data-import.');
      rl.close();
      return;
    }

    console.log('\n📋 Available subjects to add papers for:');
    matches.forEach((m, i) => console.log(`${i + 1}. ${m.name} (${m.syllabus_type}) - ${m.json_files.length} files`));
    const choice = await ask('\nYour choice (number or "exit"): ');
    if (choice.toLowerCase() === 'exit') { rl.close(); return; }
    const idx = parseInt(choice, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= matches.length) { console.log('Invalid selection.'); rl.close(); return; }
    const selected = matches[idx];
    rl.close();

    console.log(`\n🎯 Processing papers for: ${selected.name} (${selected.syllabus_type})`);

    // Helpers
    function normalizeSession(sessionRaw) {
      const s = sessionRaw.toLowerCase();
      if (s.includes('jan')) return 'January';
      if (s.includes('june') || s.includes('may')) return 'May/June';
      if (s.includes('oct') || s.includes('nov')) return 'Oct/Nov';
      return sessionRaw;
    }

    const examSessionKeySet = new Map(); // key => { session, year }
    const papersMap = new Map(); // key => { exam_session_key, unit_code, ...links }

    for (const file of selected.json_files) {
      const filePath = path.join(selected.directory_path, file);
      let data;
      try {
        data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (!Array.isArray(data) || data.length === 0) continue;
      } catch (e) {
        console.warn(`Skipping invalid JSON: ${file}`);
        continue;
      }

      const base = file.replace('.json', '');
      const match = base.match(/^([A-Za-z]+)(?:[\/\-]([A-Za-z]+))?[\-\/]((?:19|20)\d{2})$/);
      if (!match) continue;
      const part1 = match[1];
      const part2 = match[2];
      const year = parseInt(match[3], 10);
      const session = normalizeSession(part2 ? `${part1}/${part2}` : part1);
      const examKey = `${session}-${year}`;
      if (!examSessionKeySet.has(examKey)) examSessionKeySet.set(examKey, { session, year });

      for (const item of data) {
        const name = item.Name;
        const link = item.Link;
        if (!name || !link) continue;
        const lower = String(name).toLowerCase();
        if (lower.includes('unused')) continue;

        let materialType = null;
        if (lower.includes('question paper') || lower.includes('qp')) materialType = 'question_paper_link';
        else if (lower.includes('mark scheme') || lower.includes('ms')) materialType = 'mark_scheme_link';
        else if (lower.includes('examiner report') || lower.includes('er')) materialType = 'examiner_report_link';
        else if (lower.includes('provisional mark scheme')) materialType = 'mark_scheme_link';
        if (!materialType) continue;

        let unitCode = null;
        if (selected.syllabus_type === 'IAL') {
          const m = String(name).match(/\((W[A-Z0-9]+)(?:\/[0-9]+)?\)/);
          if (m && m[1]) unitCode = m[1];
        } else if (selected.syllabus_type === 'IGCSE') {
          const m = lower.match(/paper\s*(\b(?:1p|1pr|2p|2pr|pr|1c|1cr|2c|2cr|1b|1br|2b|2br|1|1r|2|2r|01|02)\b)/);
          if (m && m[1]) {
            unitCode = m[1].toUpperCase();
            if (unitCode === 'PR') unitCode = '2PR';
          }
        }
        if (!unitCode) continue;

        const paperKey = `${examKey}-${unitCode}`;
        if (!papersMap.has(paperKey)) {
          papersMap.set(paperKey, {
            exam_session_key: examKey,
            unit_code: unitCode,
            question_paper_link: null,
            mark_scheme_link: null,
            examiner_report_link: null
          });
        }
        const paper = papersMap.get(paperKey);
        paper[materialType] = link;
      }
    }

    console.log(`\n📅 Exam sessions found: ${examSessionKeySet.size}`);
    console.log(`📝 Paper units to insert: ${papersMap.size}`);
    if (papersMap.size === 0) { console.log('Nothing to insert.'); return; }

    // Upsert exam_sessions and map to ids
    const finalExamIds = new Map();
    for (const { session, year } of examSessionKeySet.values()) {
      // try to find existing
      const [rows] = await connection.query('SELECT id FROM exam_sessions WHERE session = ? AND year = ?', [session, year]);
      let id;
      if (rows.length > 0) {
        id = rows[0].id;
      } else {
        id = null;
        await connection.query('INSERT INTO exam_sessions (id, session, year) VALUES (UUID(), ?, ?)', [session, year]);
        const [rows2] = await connection.query('SELECT id FROM exam_sessions WHERE session = ? AND year = ? LIMIT 1', [session, year]);
        id = rows2[0].id;
      }
      finalExamIds.set(`${session}-${year}`, id);
    }
    console.log('✅ Exam sessions ensured.');

    // Prepare papers batch
    const finalPapers = [];
    for (const paper of papersMap.values()) {
      const examId = finalExamIds.get(paper.exam_session_key);
      if (!examId) continue;
      finalPapers.push([
        selected.id,
        examId,
        paper.unit_code,
        paper.question_paper_link,
        paper.mark_scheme_link,
        paper.examiner_report_link
      ]);
    }

    console.log(`\n⏳ Inserting ${finalPapers.length} papers in batches of ${BATCH_SIZE}...`);
    for (let i = 0; i < finalPapers.length; i += BATCH_SIZE) {
      const batch = finalPapers.slice(i, i + BATCH_SIZE);
      const placeholders = batch.map(() => '(UUID(),?,?,?,?,?,?)').join(',');
      const flat = batch.flat();
      // ON DUPLICATE KEY UPDATE requires a unique key; we created idx_papers_unique above
      const sql = `INSERT INTO papers (id, subject_id, exam_session_id, unit_code, question_paper_link, mark_scheme_link, examiner_report_link)
                   VALUES ${placeholders}
                   ON DUPLICATE KEY UPDATE
                     question_paper_link = VALUES(question_paper_link),
                     mark_scheme_link = VALUES(mark_scheme_link),
                     examiner_report_link = VALUES(examiner_report_link)`;
      await connection.query(sql, flat);
      console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(finalPapers.length / BATCH_SIZE)} processed`);
    }

    console.log('\n🎉 MySQL seeding finished successfully!');
    console.log(`📊 Summary for ${selected.name} (${selected.syllabus_type}):`);
    console.log(`  - Exam sessions processed: ${examSessionKeySet.size}`);
    console.log(`  - Papers processed: ${finalPapers.length}`);
    console.log(`  - Files processed: ${selected.json_files.length}`);
  } catch (e) {
    console.error('❌ Seeding failed:', e.message);
    if (e.code) console.error('Code:', e.code);
    process.exitCode = 1;
  } finally {
    if (connection) { try { await connection.end(); } catch (_) {} }
  }
}

main();


