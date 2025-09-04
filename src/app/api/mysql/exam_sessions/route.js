import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function GET() {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query(
      'SELECT id, session, year FROM exam_sessions ORDER BY year DESC, session DESC'
    );
    return NextResponse.json({ exam_sessions: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


