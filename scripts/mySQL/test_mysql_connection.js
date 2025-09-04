// Load environment variables from .env if present
require('dotenv').config();

const readline = require('readline');

async function main() {
  // Lazy-load mysql2/promise so the script fails gracefully if not installed
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

  console.log('🧪 MySQL Connection Test');
  console.log('========================\n');
  console.log('Using configuration:');
  console.log(`  Host: ${host}`);
  console.log(`  Port: ${port}`);
  console.log(`  Database: ${database}`);
  console.log(`  Username: ${user}`);
  console.log(`  Password: ${password ? '(from env)' : '(will prompt if required)'}\n`);

  if (!password) {
    password = await ask('Enter MySQL password: ');
  }

  let connection;
  try {
    console.log('🔗 Connecting to MySQL...');
    connection = await mysql.createConnection({ host, port, user, password });
    console.log('✅ Connected to MySQL server');

    // Basic sanity query
    const [pingRows] = await connection.query('SELECT 1 + 1 AS two');
    console.log(`   Simple query result: ${pingRows[0].two}`);

    // Ensure database exists / can be used
    console.log(`\n📦 Checking access to database '${database}'...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);
    console.log(`   ✅ Using database: ${database}`);

    // List tables (may be empty)
    const [tables] = await connection.query(
      'SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? ORDER BY TABLE_NAME',
      [database]
    );
    if (tables.length === 0) {
      console.log('   (No tables found in this database)');
    } else {
      console.log('   Tables:');
      tables.slice(0, 20).forEach((t, i) => console.log(`     ${i + 1}. ${t.TABLE_NAME}`));
      if (tables.length > 20) console.log(`     ...and ${tables.length - 20} more`);
    }

    // Summary: counts per table
    if (tables.length > 0) {
      console.log('\n📊 Table Row Counts:');
      const tableNames = tables.map(t => t.TABLE_NAME);
      for (const t of tableNames) {
        try {
          const [rows] = await connection.query(`SELECT COUNT(*) AS cnt FROM \`${t}\``);
          console.log(`  - ${t}: ${rows[0].cnt}`);
        } catch (_) {
          console.log(`  - ${t}: (count failed)`);
        }
      }
    }

    // Detailed summaries for known tables (if they exist)
    const tableSet = new Set(tables.map(t => t.TABLE_NAME));

    // subjects
    if (tableSet.has('subjects')) {
      console.log('\n📚 subjects overview:');
      try {
        const [byType] = await connection.query(
          'SELECT syllabus_type, COUNT(*) AS num FROM subjects GROUP BY syllabus_type'
        );
        byType.forEach(r => console.log(`  - ${r.syllabus_type || 'UNKNOWN'}: ${r.num}`));
      } catch (_) {}
    }

    // exam_sessions
    if (tableSet.has('exam_sessions')) {
      console.log('\n🗓️  exam_sessions overview:');
      try {
        const [byYear] = await connection.query(
          'SELECT year, COUNT(*) AS num FROM exam_sessions GROUP BY year ORDER BY year DESC LIMIT 10'
        );
        if (byYear.length === 0) console.log('  - No sessions');
        byYear.forEach(r => console.log(`  - ${r.year}: ${r.num}`));
      } catch (_) {}
    }

    // papers
    if (tableSet.has('papers')) {
      console.log('\n📄 papers overview:');
      try {
        const [tot] = await connection.query('SELECT COUNT(*) AS cnt FROM papers');
        console.log(`  - Total papers: ${tot[0].cnt}`);
      } catch (_) {}
      try {
        const [byUnit] = await connection.query(
          'SELECT unit_code, COUNT(*) AS num FROM papers GROUP BY unit_code ORDER BY num DESC LIMIT 5'
        );
        if (byUnit.length > 0) {
          console.log('  - Top unit_codes:');
          byUnit.forEach(r => console.log(`    • ${r.unit_code}: ${r.num}`));
        }
      } catch (_) {}
    }

    // resources
    if (tableSet.has('resources')) {
      console.log('\n🔗 resources overview:');
      try {
        const [byType] = await connection.query(
          'SELECT resource_type, COUNT(*) AS num FROM resources GROUP BY resource_type ORDER BY num DESC'
        );
        if (byType.length === 0) console.log('  - No resources');
        byType.forEach(r => console.log(`  - ${r.resource_type}: ${r.num}`));
      } catch (_) {}
      try {
        const [byApproval] = await connection.query(
          'SELECT approved, COUNT(*) AS num FROM resources GROUP BY approved'
        );
        if (byApproval.length > 0) {
          console.log('  - By approval:');
          byApproval.forEach(r => console.log(`    • ${r.approved}: ${r.num}`));
        }
      } catch (_) {}
    }

    // community_resource_requests
    if (tableSet.has('community_resource_requests')) {
      console.log('\n🧾 community_resource_requests overview:');
      try {
        const [byApproved] = await connection.query(
          'SELECT approved, COUNT(*) AS num FROM community_resource_requests GROUP BY approved'
        );
        if (byApproved.length === 0) console.log('  - No requests');
        byApproved.forEach(r => console.log(`  - ${r.approved}: ${r.num}`));
      } catch (_) {}
      try {
        const [rejectedCount] = await connection.query(
          'SELECT SUM(CASE WHEN rejected = 1 THEN 1 ELSE 0 END) AS rejected_count FROM community_resource_requests'
        );
        console.log(`  - Rejected count: ${rejectedCount[0].rejected_count || 0}`);
      } catch (_) {}
    }

    // staff_users
    if (tableSet.has('staff_users')) {
      console.log('\n👥 staff_users overview:');
      try {
        const [byRole] = await connection.query(
          'SELECT role, COUNT(*) AS num FROM staff_users GROUP BY role'
        );
        if (byRole.length === 0) console.log('  - No staff');
        byRole.forEach(r => console.log(`  - ${r.role || 'UNKNOWN'}: ${r.num}`));
      } catch (_) {}
    }

    // Optional: run a harmless metadata query
    const [versionRows] = await connection.query('SELECT VERSION() AS version');
    console.log(`\n🖥️  MySQL version: ${versionRows[0].version}`);

    console.log('\n🎉 MySQL connectivity looks good.');
  } catch (error) {
    console.error('\n❌ MySQL test failed:');
    console.error(`   Message: ${error.message}`);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.errno !== undefined) console.error(`   Errno: ${error.errno}`);
    if (error.sqlState) console.error(`   SQLState: ${error.sqlState}`);
    console.error('\nTips:');
    console.error(' - Verify MySQL is running: brew services list (macOS) or systemctl status mysql');
    console.error(' - Confirm credentials and database name');
    console.error(' - Ensure your user has permissions to access the database');
    process.exitCode = 1;
  } finally {
    if (connection) {
      try { await connection.end(); } catch (_) {}
    }
    rl.close();
  }
}

main();


