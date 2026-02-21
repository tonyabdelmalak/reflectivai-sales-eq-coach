#!/usr/bin/env node
import { readFileSync } from 'fs';
import { getSecret } from '#airo/secrets';

const GITHUB_TOKEN = getSecret('GITHUB_TOKEN');
const REPO_OWNER = 'ReflectivEI';
const REPO_NAME = 'dev_projects_full-build2';
const BRANCH = 'main';

console.log('🚀 Starting GitHub API deployment with secrets...');

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN not found in secrets');
  process.exit(1);
}

// Files to push
const filesToPush = [
  'src/pages/dashboard.tsx',
  'src/components/roleplay-feedback-dialog.tsx'
];

async function getFileSHA(filepath) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
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
  } catch (error) {
    console.error(`Error getting SHA for ${filepath}:`, error.message);
    return null;
  }
}

async function pushFile(filepath) {
  try {
    console.log(`\n📤 Pushing ${filepath}...`);
    
    // Read file content
    const content = readFileSync(filepath, 'utf8');
    const base64Content = Buffer.from(content).toString('base64');
    
    // Get current file SHA (needed for updates)
    const sha = await getFileSHA(filepath);
    
    // Prepare request body
    const body = {
      message: `Product feedback: Dashboard UI improvements and PDF export`,
      content: base64Content,
      branch: BRANCH
    };
    
    if (sha) {
      body.sha = sha;
      console.log(`   ✓ Found existing file (SHA: ${sha.substring(0, 7)}...)`);
    } else {
      console.log(`   ℹ Creating new file`);
    }
    
    // Push to GitHub
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filepath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'ReflectivAI-Deploy'
        },
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    console.log(`   ✅ Successfully pushed ${filepath}`);
    console.log(`   📝 Commit: ${result.commit.sha.substring(0, 7)}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to push ${filepath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log(`\n📦 Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`🌿 Branch: ${BRANCH}`);
  console.log(`📁 Files to push: ${filesToPush.length}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const file of filesToPush) {
    const success = await pushFile(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // Rate limiting: wait 1 second between requests
    if (filesToPush.indexOf(file) < filesToPush.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Total: ${filesToPush.length}`);
  
  if (successCount === filesToPush.length) {
    console.log('\n🎉 All files successfully pushed to GitHub!');
    console.log('🚀 GitHub Actions will now automatically deploy to Cloudflare Pages');
    console.log(`🌐 Check deployment: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`);
    console.log('⏱️  Deployment usually takes 2-3 minutes');
    console.log('🌍 Live site: https://reflectivai-app-prod.pages.dev');
  } else {
    console.log('\n⚠️  Some files failed to push. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Deployment failed:', error);
  process.exit(1);
});
