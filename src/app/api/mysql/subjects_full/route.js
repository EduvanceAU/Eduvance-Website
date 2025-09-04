import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      'SELECT id, name, code, syllabus_type, units FROM subjects ORDER BY name ASC'
    );
    return NextResponse.json({ subjects: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


