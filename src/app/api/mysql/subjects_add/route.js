import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, code, syllabus_type, units } = body || {};
    if (!name || !syllabus_type) {
      return NextResponse.json({ error: 'Missing subject name or syllabus type' }, { status: 400 });
    }
    const pool = getMysqlPool();
    await pool.query(
      `CREATE TABLE IF NOT EXISTS subjects (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        name TEXT NOT NULL,
        code TEXT,
        syllabus_type ENUM('IGCSE','IAL') NOT NULL,
        units JSON DEFAULT (JSON_ARRAY()),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`
    );
    // Avoid duplicates by name + syllabus_type
    const [exists] = await pool.query('SELECT id FROM subjects WHERE name = ? AND syllabus_type = ? LIMIT 1', [name, syllabus_type]);
    if (exists && exists.length > 0) {
      return NextResponse.json({ error: 'Subject already exists' }, { status: 409 });
    }
    await pool.query(
      'INSERT INTO subjects (id, name, code, syllabus_type, units) VALUES (UUID(), ?, ?, ?, CAST(? AS JSON))',
      [name, code || null, syllabus_type, JSON.stringify(Array.isArray(units) ? units : [])]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


