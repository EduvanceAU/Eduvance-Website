import mysql from 'mysql2/promise';

let pool;

export function getMysqlPool() {
  if (!pool) {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
    const database = process.env.MYSQL_DATABASE || 'eduvance_db';
    const user = process.env.MYSQL_USER || process.env.MYSQL_USERNAME || 'root';
    const password = process.env.MYSQL_PASSWORD || '';

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}


