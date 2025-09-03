-- Staff User Creation SQL Commands
-- Generated on: 2025-09-03T05:57:34.183Z
-- User: Specter (specter@eduvance.au)
-- Role: admin


-- Create Auth User (run this in Supabase SQL Editor)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '0939b5c5-9351-46c0-b31b-bc6d6c0e30f8',
  '00000000-0000-0000-0000-000000000000',
  'specter@eduvance.au',
  crypt('lawsuit@eduvance', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);


-- Create Staff User (run this in Supabase SQL Editor)
INSERT INTO staff_users (
  id,
  username,
  email,
  password_hash,
  role,
  created_at
) VALUES (
  '0939b5c5-9351-46c0-b31b-bc6d6c0e30f8',
  'Specter',
  'specter@eduvance.au',
  '$2b$10$8tS4392c/ZGdz1d18BMpDuXXSKPHnHNLbuqSMnMIhLY3G9YATruym',
  'admin',
  NOW()
);


-- Create Auth Identity (run this in Supabase SQL Editor)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'efc4c9f3-d993-4c4f-936e-4147e7005e2f',
  '0939b5c5-9351-46c0-b31b-bc6d6c0e30f8',
  '{"sub": "0939b5c5-9351-46c0-b31b-bc6d6c0e30f8", "email": "specter@eduvance.au"}',
  'email',
  NOW(),
  NOW(),
  NOW()
);

-- Verify the user was created (optional check query)
SELECT u.id, u.email, s.username, s.role 
FROM auth.users u 
JOIN staff_users s ON u.id = s.id 
WHERE u.email = 'specter@eduvance.au';
