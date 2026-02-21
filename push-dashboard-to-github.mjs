#!/usr/bin/env node
import { getSecret } from '#airo/secrets';
import { readFileSync } from 'fs';

const token = getSecret('GITHUB_TOKEN');
const repo = 'ReflectivEI/dev_projects_full-build2';
const filepath = 'src/pages/dashboard.tsx';

async function pushToGitHub() {
  try {
    console.log('📥 Step 1: Fetching current file from GitHub...');
    
    const getUrl = `https://api.github.com/repos/${repo}/contents/${filepath}`;
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch file: ${getResponse.status}`);
    }
    
    const fileData = await getResponse.json();
    const currentSha = fileData.sha;
    console.log(`✅ Current SHA: ${currentSha.substring(0, 8)}`);
    
    console.log('\n📝 Step 2: Reading local fixed file...');
    const localContent = readFileSync(filepath, 'utf-8');
    const base64Content = Buffer.from(localContent).toString('base64');
    console.log(`✅ File size: ${localContent.length} bytes`);
    
    // Verify fix is present
    if (!localContent.includes('/api/chat/send')) {
      throw new Error('❌ Local file does not contain /api/chat/send fix!');
    }
    if (!localContent.includes('AI Performance Coach')) {
      throw new Error('❌ Local file does not contain AI Performance Coach feature!');
    }
    console.log('✅ Verified: Local file contains AI Performance Coach with /api/chat/send');
    
    console.log('\n🚀 Step 3: Pushing to GitHub via API...');
    
    const updateUrl = `https://api.github.com/repos/${repo}/contents/${filepath}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Add AI Performance Coach feature to Dashboard using /api/chat/send endpoint',
        content: base64Content,
        sha: currentSha,
        branch: 'main'
      })
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update file: ${updateResponse.status} - ${errorText}`);
    }
    
    const result = await updateResponse.json();
    console.log(`✅ Successfully pushed to GitHub!`);
    console.log(`✅ New commit: ${result.commit.sha.substring(0, 8)}`);
    console.log(`✅ Commit message: ${result.commit.message}`);
    console.log(`\n🔗 View on GitHub: https://github.com/${repo}/commit/${result.commit.sha}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

pushToGitHub();
