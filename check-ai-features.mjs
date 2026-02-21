#!/usr/bin/env node
import { getSecret } from '#airo/secrets';

const token = getSecret('GITHUB_TOKEN');

async function checkFile(filepath) {
  const url = `https://api.github.com/repos/ReflectivEI/dev_projects_full-build2/contents/${filepath}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3.raw'
    }
  });
  const content = await response.text();
  
  // Check if file uses apiRequest and /api/chat/send
  const hasApiRequest = content.includes('apiRequest');
  const hasChatSend = content.includes('/api/chat/send');
  const hasNormalize = content.includes('normalizeAIResponse');
  
  console.log(`\n📄 ${filepath}`);
  console.log(`  apiRequest: ${hasApiRequest ? '✅' : '❌'}`);
  console.log(`  /api/chat/send: ${hasChatSend ? '✅' : '❌'}`);
  console.log(`  normalizeAIResponse: ${hasNormalize ? '✅' : '❌'}`);
  
  return { filepath, hasApiRequest, hasChatSend, hasNormalize };
}

try {
  console.log('🔍 Checking AI feature implementations on GitHub...');
  
  const results = await Promise.all([
    checkFile('src/pages/frameworks.tsx'),
    checkFile('src/pages/knowledge.tsx'),
    checkFile('src/pages/modules.tsx')
  ]);
  
  console.log('\n📊 SUMMARY:');
  const allGood = results.every(r => r.hasApiRequest && r.hasChatSend && r.hasNormalize);
  
  if (allGood) {
    console.log('✅ All pages use correct pattern!');
    console.log('✅ All pages call /api/chat/send');
    console.log('✅ All pages use normalizeAIResponse');
    console.log('\n🎯 CONCLUSION: Features should work! Need user testing to confirm.');
  } else {
    console.log('❌ Some pages missing correct implementation');
    console.log('🔧 Fixes needed');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
