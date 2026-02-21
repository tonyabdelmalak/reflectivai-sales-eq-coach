#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_TOKEN_HERE';
const REPO_OWNER = 'ReflectivEI';
const REPO_NAME = 'dev_projects_full-build2';
const BRANCH = 'main';

const files = [
  'src/pages/dashboard.tsx',
  'src/components/roleplay-feedback-dialog.tsx'
];

async function getFileSHA(filepath, token) {
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}?ref=${BRANCH}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ReflectivAI-Deploy'
      }
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    return data.sha;
  }
  return null;
}

async function pushFile(filepath, token) {
  try {
    const content = readFileSync(filepath, 'utf8');
    const base64Content = Buffer.from(content).toString('base64');
    
    const sha = await getFileSHA(filepath, token);
    
    const body = {
      message: `Product feedback: Dashboard UI improvements and PDF export`,
      content: base64Content,
      branch: BRANCH
    };
    
    if (sha) {
      body.sha = sha;
    }
    
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'ReflectivAI-Deploy'
        },
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ ${filepath}: ${response.status} - ${error}`);
      return false;
    }
    
    const result = await response.json();
    console.log(`✅ ${filepath}: ${result.commit.sha.substring(0, 7)}`);
    return true;
  } catch (error) {
    console.error(`❌ ${filepath}: ${error.message}`);
    return false;
  }
}

console.log('🚀 Pushing to GitHub...');
console.log('');

let successCount = 0;
for (const file of files) {
  const success = await pushFile(file, GITHUB_TOKEN);
  if (success) successCount++;
  await new Promise(resolve => setTimeout(resolve, 1000));
}

console.log('');
console.log(`📊 ${successCount}/${files.length} files pushed`);

if (successCount === files.length) {
  console.log('🎉 SUCCESS!');
  console.log('🔗 https://github.com/ReflectivEI/dev_projects_full-build2/actions');
  console.log('🌐 https://reflectivai-app-prod.pages.dev');
} else {
  console.log('❌ Some files failed');
  process.exit(1);
}
