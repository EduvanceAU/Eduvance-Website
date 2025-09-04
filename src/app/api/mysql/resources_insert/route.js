import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      subject_id,
      resource_type,
      title,
      description,
      link,
      unit_chapter_name,
      contributor_email,
      approved
    } = body || {};

    if (!subject_id || !resource_type || !title || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getMysqlPool();

    // Ensure table exists
    await pool.query(
      `CREATE TABLE IF NOT EXISTS resources (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        subject_id CHAR(36) NOT NULL,
        resource_type ENUM('note','essay_questions','assorted_papers','youtube_videos','topic_question','commonly_asked_questions','solved_papers','extra_resource') NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        link TEXT NOT NULL,
        contributor_email TEXT,
        unit_chapter_name TEXT,
        approved ENUM('Approved','Unapproved','Pending') DEFAULT 'Unapproved',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT resources_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id)
          ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB;`
    );

    const safeApproved = approved || 'Approved';
    const unitValue = unit_chapter_name || 'General';
    const emailValue = contributor_email || 'staff@example.com';

    await pool.query(
      `INSERT INTO resources (id, subject_id, resource_type, title, description, link, contributor_email, unit_chapter_name, approved)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_id, resource_type, title, description || null, link, emailValue, unitValue, safeApproved]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


