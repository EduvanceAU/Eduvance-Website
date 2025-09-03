const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const https = require('https');
const http = require('http');
require('dotenv').config();

console.log('🔍 Supabase Connection Diagnostics');
console.log('===================================\n');

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('1. Environment Variables:');
console.log(`   SUPABASE_URL: ${supabaseUrl}`);
console.log(`   SERVICE_ROLE_KEY: ${supabaseServiceRoleKey ? '✅ Present' : '❌ Missing'}\n`);

// Test 1: Basic URL parsing
console.log('2. URL Parsing Test:');
try {
  const url = new URL(supabaseUrl);
  console.log(`   ✅ URL is valid`);
  console.log(`   Protocol: ${url.protocol}`);
  console.log(`   Hostname: ${url.hostname}`);
  console.log(`   Port: ${url.port || (url.protocol === 'https:' ? '443' : '80')}\n`);
} catch (error) {
  console.log(`   ❌ Invalid URL: ${error.message}\n`);
  process.exit(1);
}

// Test 2: Node.js built-in fetch test
console.log('3. Node.js Built-in Fetch Test:');
async function testBuiltinFetch() {
  try {
    console.log('   Testing built-in fetch...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`
      },
      timeout: 10000
    });
    console.log(`   ✅ Built-in fetch works - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Built-in fetch failed: ${error.message}`);
    console.log(`   Error code: ${error.code}`);
    console.log(`   Error type: ${error.constructor.name}`);
    return false;
  }
}

// Test 3: node-fetch test
console.log('4. node-fetch Library Test:');
async function testNodeFetch() {
  try {
    console.log('   Testing node-fetch...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`
      },
      timeout: 10000
    });
    console.log(`   ✅ node-fetch works - Status: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`   ❌ node-fetch failed: ${error.message}`);
    console.log(`   Error code: ${error.code}`);
    console.log(`   Error type: ${error.constructor.name}`);
    return false;
  }
}

// Test 4: HTTPS module test
console.log('5. Native HTTPS Module Test:');
async function testHttpsModule() {
  return new Promise((resolve) => {
    try {
      console.log('   Testing native HTTPS module...');
      const url = new URL(`${supabaseUrl}/rest/v1/`);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'HEAD',
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        console.log(`   ✅ HTTPS module works - Status: ${res.statusCode}`);
        resolve(true);
      });

      req.on('error', (error) => {
        console.log(`   ❌ HTTPS module failed: ${error.message}`);
        console.log(`   Error code: ${error.code}`);
        resolve(false);
      });

      req.on('timeout', () => {
        console.log(`   ❌ HTTPS module timeout`);
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (error) {
      console.log(`   ❌ HTTPS module setup failed: ${error.message}`);
      resolve(false);
    }
  });
}

// Test 5: Supabase client test
console.log('6. Supabase Client Test:');
async function testSupabaseClient() {
  try {
    console.log('   Testing Supabase client...');
    
    // Test with node-fetch
    const supabase1 = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
      global: { fetch: fetch }
    });

    const { data, error } = await supabase1
      .from('subjects')
      .select('id, name, code, syllabus_type')
      .limit(1);

    if (error) {
      console.log(`   ❌ Supabase client failed: ${error.message}`);
      console.log(`   Error details: ${error.details}`);
      console.log(`   Error hint: ${error.hint}`);
      console.log(`   Error code: ${error.code}`);
      return false;
    } else {
      console.log(`   ✅ Supabase client works - Found ${data ? data.length : 0} records`);
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Supabase client exception: ${error.message}`);
    console.log(`   Error type: ${error.constructor.name}`);
    if (error.cause) {
      console.log(`   Root cause: ${error.cause}`);
    }
    return false;
  }
}

// Test 6: Network diagnostics
console.log('7. Network Diagnostics:');
async function testNetworkDiagnostics() {
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    try {
      const url = new URL(supabaseUrl);
      console.log(`   Testing DNS resolution for ${url.hostname}...`);
      
      const nslookup = spawn('nslookup', [url.hostname]);
      let output = '';
      let errorOutput = '';
      
      nslookup.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      nslookup.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      nslookup.on('close', (code) => {
        if (code === 0 && output.includes('Address:')) {
          console.log(`   ✅ DNS resolution successful`);
          const addresses = output.match(/Address: (\d+\.\d+\.\d+\.\d+)/g);
          if (addresses) {
            addresses.forEach(addr => console.log(`   ${addr}`));
          }
        } else {
          console.log(`   ❌ DNS resolution failed`);
          console.log(`   Exit code: ${code}`);
          if (errorOutput) console.log(`   Error: ${errorOutput.trim()}`);
        }
        resolve();
      });
    } catch (error) {
      console.log(`   ❌ Network diagnostics failed: ${error.message}`);
      resolve();
    }
  });
}

// Run all tests
async function runDiagnostics() {
  console.log('\nRunning diagnostic tests...\n');
  
  await testNetworkDiagnostics();
  console.log();
  
  const builtinFetchWorks = await testBuiltinFetch();
  console.log();
  
  const nodeFetchWorks = await testNodeFetch();
  console.log();
  
  const httpsWorks = await testHttpsModule();
  console.log();
  
  const supabaseWorks = await testSupabaseClient();
  console.log();
  
  console.log('📊 Summary:');
  console.log(`   Built-in fetch: ${builtinFetchWorks ? '✅' : '❌'}`);
  console.log(`   node-fetch: ${nodeFetchWorks ? '✅' : '❌'}`);
  console.log(`   HTTPS module: ${httpsWorks ? '✅' : '❌'}`);
  console.log(`   Supabase client: ${supabaseWorks ? '✅' : '❌'}`);
  
  if (!supabaseWorks) {
    console.log('\n🔧 Recommendations:');
    if (!httpsWorks) {
      console.log('   - Network connectivity issue detected');
      console.log('   - Check firewall/proxy settings');
      console.log('   - Try different network connection');
    } else if (!nodeFetchWorks && !builtinFetchWorks) {
      console.log('   - Fetch API issue detected');
      console.log('   - Try updating Node.js');
      console.log('   - Check for conflicting packages');
    } else {
      console.log('   - Supabase-specific issue detected');
      console.log('   - Verify API keys and project status');
      console.log('   - Check Supabase project dashboard');
    }
  }
}

runDiagnostics().catch(console.error);
