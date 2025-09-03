-- Staff role enum
CREATE TYPE staff_role AS ENUM ('admin', 'moderator');

-- Approval status enum
CREATE TYPE approved AS ENUM ('Approved', 'Unapproved', 'Pending');

-- Resource type enum
CREATE TYPE resource_type AS ENUM ('note', 'essay_questions', 'assorted_papers', 'youtube_videos', 'topic_question', 'commonly_asked_questions', 'solved_papers', 'extra_resource');

-- Syllabus type enum
CREATE TYPE syllabus_type AS ENUM ('IGCSE', 'IAL');


CREATE TABLE public.community_resource_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contributor_name text,
  contributor_email text NOT NULL,
  title text NOT NULL,
  description text,
  link text NOT NULL,
  resource_type text NOT NULL,
  unit_chapter_name text,
  subject_id uuid,
  approved USER-DEFINED DEFAULT 'Unapproved'::approved,
  approved_at timestamp with time zone,
  approved_by text,
  rejection_reason text,
  rejected boolean,
  submitter_ip inet,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  version integer DEFAULT 1 CHECK (version > 0),
  like_count bigint DEFAULT '0'::bigint CHECK (like_count >= 0),
  dislike_count bigint DEFAULT '0'::bigint CHECK (dislike_count >= 0),
  CONSTRAINT community_resource_requests_pkey PRIMARY KEY (id)
);

CREATE TABLE public.exam_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session text NOT NULL,
  year integer NOT NULL CHECK (year >= 1900 AND year <= 2100),
  CONSTRAINT exam_sessions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.papers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  exam_session_id uuid NOT NULL,
  unit_code text NOT NULL,
  question_paper_link text,
  mark_scheme_link text,
  examiner_report_link text,
  CONSTRAINT papers_pkey PRIMARY KEY (id),
  CONSTRAINT papers_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT papers_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.exam_sessions(id)
);

CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  resource_type USER-DEFINED NOT NULL,
  title text NOT NULL,
  description text,
  link text NOT NULL,
  contributor_email text,
  unit_chapter_name text DEFAULT 'NULL'::text,
  approved USER-DEFINED DEFAULT 'Unapproved'::approved,
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);

CREATE TABLE public.staff_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'moderator'::staff_role,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  syllabus_type USER-DEFINED NOT NULL,
  units jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);