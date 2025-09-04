import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      contributor_name,
      contributor_email,
      title,
      description,
      link,
      resource_type,
      unit_chapter_name,
      subject_id
    } = body || {};

    if (!title || !link || !subject_id || !resource_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getMysqlPool();

    await pool.query(
      `CREATE TABLE IF NOT EXISTS community_resource_requests (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        contributor_name TEXT,
        contributor_email TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        link TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        unit_chapter_name TEXT,
        subject_id CHAR(36),
        approved ENUM('Approved','Unapproved','Pending') DEFAULT 'Unapproved',
        approved_at TIMESTAMP NULL,
        approved_by TEXT,
        rejection_reason TEXT,
        rejected BOOLEAN,
        submitter_ip VARCHAR(45),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INT DEFAULT 1,
        like_count BIGINT DEFAULT 0,
        dislike_count BIGINT DEFAULT 0,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`
    );

    const submitted_at = new Date();
    const safeContributorEmail = contributor_email || 'contributor@example.com';
    const safeContributorName = contributor_name || 'Anonymous Contributor';

    await pool.query(
      `INSERT INTO community_resource_requests (
        id, contributor_name, contributor_email, title, description, link, resource_type, unit_chapter_name,
        subject_id, approved, submitted_at
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, 'Unapproved', ?)` ,
      [
        safeContributorName,
        safeContributorEmail,
        title,
        description || null,
        link,
        resource_type,
        unit_chapter_name || null,
        subject_id,
        submitted_at
      ]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


