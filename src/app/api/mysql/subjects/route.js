import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const syllabusType = searchParams.get('type');
    if (!syllabusType) {
      return NextResponse.json({ error: 'Missing type' }, { status: 400 });
    }
    const pool = getMysqlPool();
    const [rows] = await pool.query('SELECT name FROM subjects WHERE syllabus_type = ? ORDER BY name ASC', [syllabusType]);
    return NextResponse.json({ subjects: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


