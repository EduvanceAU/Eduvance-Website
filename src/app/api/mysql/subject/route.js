import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('name');
    const syllabusType = searchParams.get('type');
    if (!subjectName || !syllabusType) {
      return NextResponse.json({ error: 'Missing name or type' }, { status: 400 });
    }
    const pool = getMysqlPool();
    const [rows] = await pool.query('SELECT id, code, units FROM subjects WHERE name = ? AND syllabus_type = ? LIMIT 1', [subjectName, syllabusType]);
    if (!rows || rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ subject: rows[0] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


