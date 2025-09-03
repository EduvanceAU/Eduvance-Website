require('dotenv').config();
const { spawn } = require('child_process');

async function validateSupabaseProject() {
  console.log('🔍 Supabase Project Validation');
  console.log('==============================\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Current Configuration:');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Anon Key: ${supabaseAnonKey ? 'Present (' + supabaseAnonKey.substring(0, 20) + '...)' : 'Missing'}`);
  console.log(`Service Role Key: ${supabaseServiceRoleKey ? 'Present (' + supabaseServiceRoleKey.substring(0, 20) + '...)' : 'Missing'}\n`);
  
  // Step 1: Extract project reference from URL
  let projectRef = null;
  try {
    const url = new URL(supabaseUrl);
    projectRef = url.hostname.split('.')[0];
    console.log(`Project Reference: ${projectRef}\n`);
  } catch (error) {
    console.log('❌ Invalid URL format\n');
    return;
  }
  
  // Step 2: Test DNS resolution
  console.log('🌐 Testing DNS Resolution...');
  const dnsResult = await testDNS(new URL(supabaseUrl).hostname);
  if (dnsResult.success) {
    console.log('✅ DNS resolution successful');
    if (dnsResult.addresses) {
      dnsResult.addresses.forEach(addr => console.log(`   ${addr}`));
    }
  } else {
    console.log('❌ DNS resolution failed');
    console.log(`   Error: ${dnsResult.error}`);
    
    console.log('\n🔧 Possible Solutions:');
    console.log('1. Wait 2-5 minutes if the project was just created');
    console.log('2. Check your Supabase dashboard: https://app.supabase.com/projects');
    console.log('3. Verify the project URL is correct');
    console.log('4. Try using a different network connection');
    console.log('5. Check if your DNS settings are blocking Supabase domains\n');
  }
  
  // Step 3: Test basic HTTP connectivity (if DNS works)
  if (dnsResult.success) {
    console.log('\n🔗 Testing HTTP Connectivity...');
    const httpResult = await testHTTPConnectivity(supabaseUrl);
    if (httpResult.success) {
      console.log('✅ HTTP connectivity successful');
      console.log(`   Status: ${httpResult.status}`);
    } else {
      console.log('❌ HTTP connectivity failed');
      console.log(`   Error: ${httpResult.error}`);
    }
  }
  
  // Step 4: Test Supabase REST API
  if (dnsResult.success) {
    console.log('\n🗄️  Testing Supabase REST API...');
    const apiResult = await testSupabaseAPI(supabaseUrl, supabaseAnonKey);
    if (apiResult.success) {
      console.log('✅ Supabase REST API accessible');
      console.log(`   Status: ${apiResult.status}`);
    } else {
      console.log('❌ Supabase REST API failed');
      console.log(`   Error: ${apiResult.error}`);
    }
  }
  
  // Step 5: Recommendations
  console.log('\n📋 Summary & Recommendations:');
  console.log('============================');
  
  if (!dnsResult.success) {
    console.log('🔴 Critical Issue: DNS Resolution Failed');
    console.log('This usually means:');
    console.log('  • The Supabase project doesn\'t exist or was deleted');
    console.log('  • The project is still being provisioned (wait 5-10 minutes)');
    console.log('  • Network/firewall is blocking Supabase domains');
    console.log('  • The URL in your .env file is incorrect\n');
    
    console.log('Next Steps:');
    console.log('1. Log into https://app.supabase.com/projects');
    console.log('2. Verify your project exists and is active');
    console.log('3. Copy the exact URL from the project settings');
    console.log('4. Update your .env file with the correct URL');
  } else {
    console.log('🟢 DNS Resolution: Working');
    console.log('Your project URL can be resolved. Try running the seed script again.');
  }
}

async function testDNS(hostname) {
  return new Promise((resolve) => {
    const nslookup = spawn('nslookup', [hostname]);
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
        const addresses = output.match(/Address: (\d+\.\d+\.\d+\.\d+)/g);
        resolve({
          success: true,
          addresses: addresses || []
        });
      } else {
        resolve({
          success: false,
          error: errorOutput || `Exit code: ${code}`,
          code
        });
      }
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      nslookup.kill();
      resolve({ success: false, error: 'DNS lookup timeout' });
    }, 5000);
  });
}

async function testHTTPConnectivity(url) {
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    const curl = spawn('curl', ['-I', '-s', '--connect-timeout', '10', url]);
    let output = '';
    let errorOutput = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    curl.on('close', (code) => {
      if (code === 0 && output.includes('HTTP')) {
        const statusMatch = output.match(/HTTP\/\d+\.\d+ (\d+)/);
        resolve({
          success: true,
          status: statusMatch ? statusMatch[1] : 'Unknown'
        });
      } else {
        resolve({
          success: false,
          error: errorOutput || `Curl exit code: ${code}`
        });
      }
    });
  });
}

async function testSupabaseAPI(url, anonKey) {
  if (!anonKey) {
    return { success: false, error: 'No anon key provided' };
  }
  
  const { spawn } = require('child_process');
  const apiUrl = `${url}/rest/v1/`;
  
  return new Promise((resolve) => {
    const curl = spawn('curl', [
      '-I', '-s', '--connect-timeout', '10',
      '-H', `apikey: ${anonKey}`,
      '-H', `Authorization: Bearer ${anonKey}`,
      apiUrl
    ]);
    
    let output = '';
    let errorOutput = '';
    
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    curl.on('close', (code) => {
      if (code === 0 && output.includes('HTTP')) {
        const statusMatch = output.match(/HTTP\/\d+\.\d+ (\d+)/);
        resolve({
          success: true,
          status: statusMatch ? statusMatch[1] : 'Unknown'
        });
      } else {
        resolve({
          success: false,
          error: errorOutput || `API test failed with code: ${code}`
        });
      }
    });
  });
}

validateSupabaseProject().catch(console.error);
