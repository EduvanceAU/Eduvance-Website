// Load environment variables
require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcryptjs');

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

  console.log('--- Create New Staff User (MySQL) ---');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`Database: ${database}`);
  console.log(`Username: ${user}`);
  console.log(`Password: ${password ? '(from env)' : '(will prompt if missing)'}\n`);

  if (!password) {
    password = await ask('Enter MySQL password: ');
  }

  const username = await ask('Staff Username: ');
  const email = await ask('Staff Email: ');
  const rawPassword = await ask('Staff Password: ');
  const roleInput = await ask('Role (admin/moderator) [moderator]: ');
  const role = roleInput === 'admin' ? 'admin' : 'moderator';

  if (!username || !email || !rawPassword) {
    console.error('Username, email, and password are required.');
    rl.close();
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);

    // Ensure staff_users table exists (matches init_mysql_schema.js)
    await connection.query(
      `CREATE TABLE IF NOT EXISTS staff_users (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role ENUM('admin','moderator') NOT NULL DEFAULT 'moderator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`
    );

    // Check duplicates for nicer message
    const [existingUsername] = await connection.query(
      'SELECT id FROM staff_users WHERE username = ? LIMIT 1',
      [username]
    );
    if (existingUsername.length > 0) {
      console.error('A staff user with this username already exists.');
      rl.close();
      process.exit(1);
    }

    const [existingEmail] = await connection.query(
      'SELECT id FROM staff_users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existingEmail.length > 0) {
      console.error('A staff user with this email already exists.');
      rl.close();
      process.exit(1);
    }

    const password_hash = await bcrypt.hash(rawPassword, 10);

    await connection.query(
      'INSERT INTO staff_users (id, username, email, password_hash, role) VALUES (UUID(), ?, ?, ?, ?)',
      [username, email, password_hash, role]
    );

    const [created] = await connection.query(
      'SELECT id, username, email, role, created_at FROM staff_users WHERE email = ? LIMIT 1',
      [email]
    );

    console.log('Staff user created successfully:');
    console.log({
      id: created[0].id,
      username: created[0].username,
      email: created[0].email,
      role: created[0].role,
      created_at: created[0].created_at
    });
  } catch (error) {
    if (error && error.code === 'ER_DUP_ENTRY') {
      console.error('Failed to create staff user: duplicate username or email.');
    } else {
      console.error('Failed to create staff user:', error.message);
      if (error.code) console.error('Code:', error.code);
    }
    process.exitCode = 1;
  } finally {
    rl.close();
    if (connection) { try { await connection.end(); } catch (_) {} }
  }
}

main();