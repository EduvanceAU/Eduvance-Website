require('dotenv').config();

const fs = require('fs');
const path = require('path');

async function main() {
  let mysql;
  try {
    mysql = require('mysql2/promise');
  } catch (e) {
    console.error('Missing dependency: mysql2');
    console.error('Install it with: npm i mysql2');
    process.exit(1);
  }

  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const database = process.env.MYSQL_DATABASE || 'eduvance_db';
  const user = process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root';
  const password = process.env.MYSQL_PASSWORD || '';

  const DATA_IMPORT_DIR = './data-import';

  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);

    // Ensure subjects table exists
    await connection.query(
      `CREATE TABLE IF NOT EXISTS subjects (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        name TEXT NOT NULL,
        code TEXT,
        syllabus_type ENUM('IGCSE','IAL') NOT NULL,
        units JSON DEFAULT (JSON_ARRAY()),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`
    );

    // Build subject list from data-import folder names
    const subjectsToInsert = [];
    if (fs.existsSync(DATA_IMPORT_DIR)) {
      const typeDirs = fs.readdirSync(DATA_IMPORT_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
      for (const type of typeDirs) {
        if (!['IAL','IGCSE'].includes(type)) continue;
        const typePath = path.join(DATA_IMPORT_DIR, type);
        const subjectDirs = fs.readdirSync(typePath, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
        for (const subjectDir of subjectDirs) {
          const match = subjectDir.match(/^(.+?)\s*\((\d{4})\)$/);
          const name = match ? match[1].trim() : subjectDir;
          // We do not have codes in folder names; set code NULL
          subjectsToInsert.push({ name, code: null, syllabus_type: type });
        }
      }
    }

    if (subjectsToInsert.length === 0) {
      console.log('No subjects discovered in data-import.');
      return;
    }

    // Insert missing subjects (avoid duplicates by name+type)
    let inserted = 0;
    for (const s of subjectsToInsert) {
      const [exists] = await connection.query(
        'SELECT id FROM subjects WHERE name = ? AND syllabus_type = ? LIMIT 1',
        [s.name, s.syllabus_type]
      );
      if (exists.length > 0) continue;
      await connection.query(
        'INSERT INTO subjects (id, name, code, syllabus_type, units) VALUES (UUID(), ?, ?, ?, JSON_ARRAY())',
        [s.name, s.code, s.syllabus_type]
      );
      inserted++;
    }

    console.log(`Done. Inserted ${inserted} new subjects.`);
  } catch (e) {
    console.error('Subject seeding failed:', e.message);
    if (e.code) console.error('Code:', e.code);
    process.exitCode = 1;
  } finally {
    if (connection) { try { await connection.end(); } catch (_) {} }
  }
}

main();


