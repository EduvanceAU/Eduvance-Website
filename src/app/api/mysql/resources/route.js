import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectName = searchParams.get('subject');
    const syllabusType = searchParams.get('type');
    if (!subjectName || !syllabusType) return NextResponse.json({ error: 'Missing subject or type' }, { status: 400 });
    const pool = getMysqlPool();
    const [subj] = await pool.query('SELECT id FROM subjects WHERE name = ? AND syllabus_type = ? LIMIT 1', [subjectName, syllabusType]);
    if (!subj || subj.length === 0) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    const subjectId = subj[0].id;
    const [rows] = await pool.query(
      `SELECT id, contributor_name, contributor_email, title, description, link, resource_type, unit_chapter_name,
              approved, approved_at, rejection_reason, rejected, submitted_at, like_count, dislike_count
         FROM community_resource_requests
        WHERE subject_id = ? AND approved = 'Approved'
        ORDER BY unit_chapter_name ASC, resource_type ASC, title ASC`,
      [subjectId]
    );
    return NextResponse.json({ resources: rows });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, like_count, dislike_count } = body || {};
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const pool = getMysqlPool();
    await pool.query('UPDATE community_resource_requests SET like_count = ?, dislike_count = ? WHERE id = ?', [like_count ?? 0, dislike_count ?? 0, id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


