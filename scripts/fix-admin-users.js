// Fix admin users in Supabase
// Run: npx ts-node --esm scripts/fix-admin-users.ts

const crypto = require('crypto');
const https = require('https');

const SUPABASE_URL = 'https://szgacfttbzcagghkdszd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env variable');
  process.exit(1);
}

// Bcrypt hashes for the passwords (cost 10)
const HASHES = {
  Jenny: '$2b$10$M/9x77nZghRgxIR/Xg0z2.tZha934VDJAiKz70/sZUfTdXJ9SX.hW',
  Edison: '$2b$10$pA2HtS6s7kdFLiml8wvO2OGzBXwOxmiIU5NHbtPXEvgG78v4hU.3.',
  Mo: '$2b$10$GJGGg77XH9zdahaTEQ4/IOxfwnM9GDUJa1no/d1gx0kA/IqphpWge',
};

const ADMIN_USERS = [
  { phone: '+14793297979', password_hash: HASHES.Jenny, name: 'Jenny', role: 'employee' },
  { phone: '+18326176170', password_hash: HASHES.Edison, name: 'Edison', role: 'manager' },
  { phone: '+14797198198', password_hash: HASHES.Mo, name: 'Mo', role: 'manager' },
];

function makeRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const headers = {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
      ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
    };
    
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function fixAdminUsers() {
  console.log('Checking existing admin users...');
  
  // First check what users exist
  const { status, data } = await makeRequest('GET', '/rest/v1/admin_users?select=id,phone,name');
  console.log('Existing users:', JSON.stringify(data, null, 2));
  
  // Upsert each admin user
  for (const user of ADMIN_USERS) {
    console.log(`Upserting ${user.name} (${user.phone})...`);
    
    const result = await makeRequest('POST', '/rest/v1/admin_users', user);
    console.log(`  Result: ${result.status}`, JSON.stringify(result.data));
  }
  
  console.log('\nDone! Now verify by logging in.');
}

fixAdminUsers().catch(console.error);