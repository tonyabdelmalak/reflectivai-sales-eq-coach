import https from 'https';
import { getSecret } from '#airo/secrets';
import fs from 'fs';

const token = getSecret('GITHUB_TOKEN');
const owner = 'ReflectivEI';
const repo = 'dev_projects_full-build2';

const content = fs.readFileSync('AI_FEATURES_VERIFICATION_COMPLETE.md', 'utf-8');
const base64Content = Buffer.from(content).toString('base64');

const data = JSON.stringify({
  message: 'docs: AI features verification - all pages wired to /api/chat/send',
  content: base64Content,
  branch: 'main'
});

const options = {
  hostname: 'api.github.com',
  path: `/repos/${owner}/${repo}/contents/AI_FEATURES_VERIFICATION_COMPLETE.md`,
  method: 'PUT',
  headers: {
    'Authorization': `token ${token}`,
    'User-Agent': 'Airo-Builder',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 201) {
      console.log('✅ Verification document pushed to GitHub');
      console.log('📄 File: AI_FEATURES_VERIFICATION_COMPLETE.md');
      console.log('🔗 https://github.com/ReflectivEI/dev_projects_full-build2/blob/main/AI_FEATURES_VERIFICATION_COMPLETE.md');
    } else {
      console.log(`❌ Failed: ${res.statusCode}`);
      console.log(body);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
