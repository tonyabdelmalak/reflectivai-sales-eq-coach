const { getSecret } = require('#airo/secrets');
const { execSync } = require('child_process');
const https = require('https');

const token = getSecret('GITHUB_TOKEN');
const owner = 'ReflectivEI';
const repo = 'dev_projects_full-build2';

// Get current commit SHA
const sha = execSync('git rev-parse HEAD').toString().trim();
console.log('Current SHA:', sha);

// Update main branch ref via API
const data = JSON.stringify({ sha, force: false });
const options = {
  hostname: 'api.github.com',
  path: `/repos/${owner}/${repo}/git/refs/heads/main`,
  method: 'PATCH',
  headers: {
    'Authorization': `token ${token}`,
    'User-Agent': 'Node.js',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
  process.exit(1);
});

req.write(data);
req.end();
