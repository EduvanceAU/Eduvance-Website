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

  const SUP_HOST = process.env.MYSQL_HOST || 'localhost';
  const SUP_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const SUP_DB = process.env.MYSQL_DATABASE || 'eduvance_db';
  const SUP_USER = process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root';
  let SUP_PASS = process.env.MYSQL_PASSWORD || '';

  // Prompt for password if not provided via env
  if (!SUP_PASS) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
    SUP_PASS = await ask('Enter MySQL password: ');
    rl.close();
  }

  const SUBJECTS_DIR = path.join(__dirname, '../src/app/subjects');
  const TEMPLATE_DIR = path.join(__dirname, '../src/app/subjects/template');

  function toKebabCase(str) {
    return str.toLowerCase().replace(/\s+/g, '-');
  }

  function copyTemplateFolder(srcDir, destDir, replacements) {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      if (entry.isDirectory()) {
        copyTemplateFolder(srcPath, destPath, replacements);
      } else if (entry.isFile()) {
        let content = fs.readFileSync(srcPath, 'utf8');
        for (const [key, value] of Object.entries(replacements)) {
          const regex = new RegExp(key, 'g');
          content = content.replace(regex, value);
        }
        fs.writeFileSync(destPath, content, 'utf8');
      }
    }
  }

  let connection;
  try {
    connection = await mysql.createConnection({ host: SUP_HOST, port: SUP_PORT, user: SUP_USER, password: SUP_PASS });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${SUP_DB}\``);
    await connection.query(`USE \`${SUP_DB}\``);

    const [subjects] = await connection.query('SELECT name, syllabus_type, code FROM subjects');
    if (!subjects || subjects.length === 0) {
      console.log('No subjects found in MySQL. Add subjects first (see scripts/seed_mysql_subjects.js).');
      return;
    }

    const existingFolders = fs.readdirSync(SUBJECTS_DIR)
      .filter(f => fs.statSync(path.join(SUBJECTS_DIR, f)).isDirectory());

    const subjectMap = {};
    for (const subj of subjects) {
      const kebab = toKebabCase(subj.name);
      if (!subjectMap[kebab]) subjectMap[kebab] = { name: subj.name, syllabus_types: new Set(), codes: {} };
      if (subj.syllabus_type) subjectMap[kebab].syllabus_types.add(subj.syllabus_type);
      if (subj.syllabus_type && subj.code) subjectMap[kebab].codes[subj.syllabus_type] = subj.code;
    }

    const missingSubjects = Object.keys(subjectMap).filter(kebab => !existingFolders.includes(kebab));

    if (missingSubjects.length === 0) {
      console.log('No missing subject folders. All subjects are present.');
      return;
    }

    for (const kebab of missingSubjects) {
      const subj = subjectMap[kebab];
      const subjDir = path.join(SUBJECTS_DIR, kebab);
      fs.mkdirSync(subjDir, { recursive: true });
      copyTemplateFolder(
        path.join(TEMPLATE_DIR),
        subjDir,
        {
          '\\$\\{subjectName\\}': toKebabCase(subj.name),
          '\\{subjectName\\}': subj.name,
          '\\{subjectCode\\}': subj.codes['IAL'] || subj.codes['IGCSE'] || '',
          '\\{syllabusType\\}': '',
          '\\{examCode\\}': subj.codes['IAL'] || subj.codes['IGCSE'] || ''
        }
      );
      for (const type of subj.syllabus_types) {
        const typeDir = path.join(subjDir, type);
        fs.mkdirSync(typeDir, { recursive: true });
        copyTemplateFolder(
          path.join(TEMPLATE_DIR, type),
          typeDir,
          {
            '\\$\\{subjectName\\}': toKebabCase(subj.name),
            '\\{subjectName\\}': subj.name,
            '\\{subjectCode\\}': subj.codes[type] || '',
            '\\{syllabusType\\}': type,
            '\\{examCode\\}': subj.codes[type] || ''
          }
        );
      }
    }

    console.log('\nSummary:');
    console.log(`Checked ${Object.keys(subjectMap).length} subjects. Created ${missingSubjects.length} new subject folders.`);
  } catch (e) {
    console.error('Sync failed:', e.message);
    process.exitCode = 1;
  } finally {
    if (connection) { try { await connection.end(); } catch (_) {} }
  }
}

main();


