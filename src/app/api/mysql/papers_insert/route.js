import { NextResponse } from 'next/server';
import { getMysqlPool } from '@/lib/mysql';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      subject_id,
      exam_session_id,
      unit_code,
      question_paper_link,
      mark_scheme_link,
      examiner_report_link
    } = body || {};

    if (!subject_id || !exam_session_id || !unit_code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const pool = getMysqlPool();

    // Ensure table exists
    await pool.query(
      `CREATE TABLE IF NOT EXISTS papers (
        id CHAR(36) NOT NULL DEFAULT (UUID()),
        subject_id CHAR(36) NOT NULL,
        exam_session_id CHAR(36) NOT NULL,
        unit_code VARCHAR(100) NOT NULL,
        question_paper_link TEXT,
        mark_scheme_link TEXT,
        examiner_report_link TEXT,
        PRIMARY KEY (id),
        CONSTRAINT papers_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES subjects(id)
          ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT papers_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES exam_sessions(id)
          ON UPDATE CASCADE ON DELETE CASCADE
      ) ENGINE=InnoDB;`
    );

    // Ensure unique index for upsert-like behavior
    try {
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_papers_unique ON papers (subject_id, exam_session_id, unit_code)');
    } catch (e) {
      if (e && e.code === 'ER_PARSE_ERROR') {
        try {
          await pool.query('CREATE UNIQUE INDEX idx_papers_unique ON papers (subject_id, exam_session_id, unit_code)');
        } catch (e2) {
          if (e2 && e2.errno !== 1061) throw e2;
        }
      } else if (e && e.errno !== 1061) {
        throw e;
      }
    }

    await pool.query(
      `INSERT INTO papers (id, subject_id, exam_session_id, unit_code, question_paper_link, mark_scheme_link, examiner_report_link)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         question_paper_link = VALUES(question_paper_link),
         mark_scheme_link = VALUES(mark_scheme_link),
         examiner_report_link = VALUES(examiner_report_link)`,
      [subject_id, exam_session_id, unit_code, question_paper_link || null, mark_scheme_link || null, examiner_report_link || null]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


