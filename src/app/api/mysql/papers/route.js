import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('subject') || 'Accounting';
    const syllabusType = searchParams.get('type') || 'IAL';

    const pool = getMysqlPool();

    // Find subject id
    const [subjects] = await pool.query(
      'SELECT id, name, code FROM subjects WHERE name = ? AND syllabus_type = ? LIMIT 1',
      [subjectName, syllabusType]
    );
    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }
    const subject = subjects[0];

    // Fetch papers joined with exam_sessions
    const [rows] = await pool.query(
      `SELECT p.id, p.unit_code, p.question_paper_link, p.mark_scheme_link, p.examiner_report_link,
              e.session, e.year
         FROM papers p
         JOIN exam_sessions e ON e.id = p.exam_session_id
        WHERE p.subject_id = ?
        ORDER BY p.unit_code ASC, e.year DESC, e.session ASC`,
      [subject.id]
    );

    return NextResponse.json({ subject, papers: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


