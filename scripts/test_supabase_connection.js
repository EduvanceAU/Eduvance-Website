const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
  console.log('🧪 Testing Supabase Connection');
  console.log('==============================\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    return;
  }
  
  console.log(`Testing URL: ${supabaseUrl}`);
  console.log(`Service key: ${supabaseServiceRoleKey ? 'Present' : 'Missing'}\n`);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
    
    console.log('🔍 Attempting to connect to Supabase...');
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('subjects')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
      
      if (error.message.includes('ENOTFOUND')) {
        console.log('\n🔧 This appears to be a DNS resolution issue.');
        console.log('   The Supabase project URL cannot be resolved.');
        console.log('   Please check if the project exists and is active.');
      }
    } else {
      console.log('✅ Connection successful!');
      console.log(`   Found subjects table with ${data || 0} records`);
      console.log('\n🎉 Your Supabase connection is working correctly.');
      console.log('   You can now run the seed script: node scripts/seed_database.js');
    }
    
  } catch (error) {
    console.log('❌ Connection test failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Type: ${error.constructor.name}`);
    
    if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
      console.log('\n🔧 Network connectivity issue detected.');
      console.log('   This usually means:');
      console.log('   1. The Supabase project doesn\'t exist');
      console.log('   2. The URL in .env is incorrect');
      console.log('   3. DNS resolution problems');
      console.log('   4. Network firewall blocking access');
    }
  }
}

// Allow passing a custom URL for testing
if (process.argv.length > 2) {
  const customUrl = process.argv[2];
  const customKey = process.argv[3];
  
  if (customUrl && customKey) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = customUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = customKey;
    console.log('Using custom URL and key from command line arguments\n');
  }
}

testConnection().catch(console.error);
