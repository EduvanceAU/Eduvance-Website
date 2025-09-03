// Load environment variables from .env file
require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  console.log('--- Create New Staff User (OFFLINE MODE) ---');
  console.log('⚠️  Network restrictions detected - using offline mode');
  console.log('This will create SQL commands that you can run manually.');
  console.log('============================================\n');
  
  const username = await ask('Username: ');
  const email = await ask('Email: ');
  const password = await ask('Password: ');
  const role = await ask('Role (admin/moderator) [moderator]: ');
  const staffRole = role === 'admin' ? 'admin' : 'moderator';

  if (!username || !email || !password) {
    console.error('Username, email, and password are required.');
    rl.close();
    process.exit(1);
  }

  // Generate a UUID for the user
  const userId = generateUUID();
  
  // Hash the password
  const password_hash = await bcrypt.hash(password, 10);

  // Generate SQL commands
  const authUserSQL = `
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
  '${userId}',
  '00000000-0000-0000-0000-000000000000',
  '${email}',
  crypt('${password}', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);`;

  const staffUserSQL = `
-- Create Staff User (run this in Supabase SQL Editor)
INSERT INTO staff_users (
  id,
  username,
  email,
  password_hash,
  role,
  created_at
) VALUES (
  '${userId}',
  '${username}',
  '${email}',
  '${password_hash}',
  '${staffRole}',
  NOW()
);`;

  const identitySQL = `
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
  '${generateUUID()}',
  '${userId}',
  '{"sub": "${userId}", "email": "${email}"}',
  'email',
  NOW(),
  NOW(),
  NOW()
);`;

  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save SQL commands to file
  const sqlContent = `-- Staff User Creation SQL Commands
-- Generated on: ${new Date().toISOString()}
-- User: ${username} (${email})
-- Role: ${staffRole}

${authUserSQL}

${staffUserSQL}

${identitySQL}

-- Verify the user was created (optional check query)
SELECT u.id, u.email, s.username, s.role 
FROM auth.users u 
JOIN staff_users s ON u.id = s.id 
WHERE u.email = '${email}';
`;

  const sqlFilePath = path.join(outputDir, `create_staff_user_${username}_${Date.now()}.sql`);
  fs.writeFileSync(sqlFilePath, sqlContent);

  // Display results
  console.log('✅ Staff user data prepared successfully!\n');
  console.log('📋 User Details:');
  console.log(`   User ID: ${userId}`);
  console.log(`   Username: ${username}`);
  console.log(`   Email: ${email}`);
  console.log(`   Role: ${staffRole}`);
  console.log(`   Password Hash: ${password_hash.substring(0, 20)}...`);
  
  console.log('\n📁 SQL file created at:');
  console.log(`   ${sqlFilePath}\n`);
  
  console.log('🚀 Next Steps:');
  console.log('==============');
  console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
  console.log('2. Navigate to your project > SQL Editor');
  console.log(`3. Open and run the SQL file: ${path.basename(sqlFilePath)}`);
  console.log('4. Or copy and paste the SQL commands below:\n');
  
  console.log('📝 SQL Commands to run in Supabase:');
  console.log('===================================');
  console.log(sqlContent);

  rl.close();
}

main().catch(error => {
  console.error('Error creating offline staff user:', error.message);
  rl.close();
  process.exit(1);
});
