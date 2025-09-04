// Load environment variables
require('dotenv').config();

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

  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const database = process.env.MYSQL_DATABASE || 'eduvance_db';
  const user = process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root';
  let password = process.env.MYSQL_PASSWORD;

  console.log('🛠️  Initializing MySQL schema for Eduvance');
  console.log('==========================================\n');
  console.log('Using configuration:');
  console.log(`  Host: ${host}`);
  console.log(`  Port: ${port}`);
  console.log(`  Database: ${database}`);
  console.log(`  Username: ${user}`);
  console.log(`  Password: ${password ? '(from env)' : '(will prompt if missing)'}\n`);

  if (!password) {
    password = await ask('Enter MySQL password: ');
  }

  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    console.log('🔗 Connected to MySQL server');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);
    console.log(`✅ Using database: ${database}`);

    // MySQL-compatible schema (adapted from Backups/DB_schema.sql)
    // - UUIDs: CHAR(36) with default UUID()
    // - Enums: MySQL ENUM columns
    // - JSONB: JSON
    // - inet: VARCHAR(45)
    // - timestamptz: TIMESTAMP
    // - Removed schema qualifiers (public.)

    const ddlStatements = [
      // subjects first (FK target)
      `CREATE TABLE IF NOT EXISTS subjects (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        name TEXT NOT NULL,
        code TEXT,
        syllabus_type ENUM('IGCSE','IAL') NOT NULL,
        units JSON DEFAULT (JSON_ARRAY()),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`,

      // exam_sessions (FK target)
      `CREATE TABLE IF NOT EXISTS exam_sessions (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        session VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`,

      // staff_users (independent)
      `CREATE TABLE IF NOT EXISTS staff_users (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role ENUM('admin','moderator') NOT NULL DEFAULT 'moderator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`,

      // resources (FK to subjects)
      `CREATE TABLE IF NOT EXISTS resources (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        subject_id CHAR(36) NOT NULL,
        resource_type ENUM('note','essay_questions','assorted_papers','youtube_videos','topic_question','commonly_asked_questions','solved_papers','extra_resource') NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        link TEXT NOT NULL,
        contributor_email TEXT,
        unit_chapter_name TEXT,
        approved ENUM('Approved','Unapproved','Pending') DEFAULT 'Unapproved',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT resources_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id)
          ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB;`,

      // papers (FK to subjects, exam_sessions)
      `CREATE TABLE IF NOT EXISTS papers (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        subject_id CHAR(36) NOT NULL,
        exam_session_id CHAR(36) NOT NULL,
        unit_code VARCHAR(100) NOT NULL,
        question_paper_link TEXT,
        mark_scheme_link TEXT,
        examiner_report_link TEXT,
        PRIMARY KEY (id),
        CONSTRAINT papers_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id)
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT papers_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id)
          ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB;`,

      // community_resource_requests (optional FK to subjects)
      `CREATE TABLE IF NOT EXISTS community_resource_requests (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        contributor_name TEXT,
        contributor_email TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        link TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        unit_chapter_name TEXT,
        subject_id CHAR(36),
        approved ENUM('Approved','Unapproved','Pending') DEFAULT 'Unapproved',
        approved_at TIMESTAMP NULL,
        approved_by TEXT,
        rejection_reason TEXT,
        rejected BOOLEAN,
        submitter_ip VARCHAR(45),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INT DEFAULT 1,
        like_count BIGINT DEFAULT 0,
        dislike_count BIGINT DEFAULT 0,
        PRIMARY KEY (id),
        CONSTRAINT community_resource_requests_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id)
          ON UPDATE CASCADE ON DELETE SET NULL
      ) ENGINE=InnoDB;`
    ];

    for (const stmt of ddlStatements) {
      await connection.query(stmt);
    }

    console.log('\n🎉 Schema initialization complete.');
  } catch (error) {
    console.error('\n❌ Failed to initialize schema:');
    console.error(`   Message: ${error.message}`);
    if (error.code) console.error(`   Code: ${error.code}`);
    process.exitCode = 1;
  } finally {
    if (rl && !rl.closed) rl.close();
    if (connection) {
      try { await connection.end(); } catch (_) {}
    }
  }
}

main();


