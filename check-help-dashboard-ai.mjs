#!/usr/bin/env node
import { getSecret } from '#airo/secrets';

const token = getSecret('GITHUB_TOKEN');

async function checkFile(filepath, featureName) {
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
  
  // Check for AI-related functions
  const hasAIFunction = content.match(/async.*function.*(ai|AI|coach|Coach|support|Support)/i);
  
  console.log(`\n📄 ${filepath} (${featureName})`);
  console.log(`  apiRequest imported: ${hasApiRequest ? '✅' : '❌'}`);
  console.log(`  /api/chat/send used: ${hasChatSend ? '✅' : '❌'}`);
  console.log(`  normalizeAIResponse: ${hasNormalize ? '✅' : '❌'}`);
  console.log(`  AI function found: ${hasAIFunction ? '✅' : '❌'}`);
  
  return { filepath, featureName, hasApiRequest, hasChatSend, hasNormalize, hasAIFunction: !!hasAIFunction };
}

try {
  console.log('🔍 Checking AI features on Help Center and Dashboard pages...');
  
  const results = await Promise.all([
    checkFile('src/pages/help.tsx', 'AI Support'),
    checkFile('src/pages/dashboard.tsx', 'AI Performance Coach')
  ]);
  
  console.log('\n📊 SUMMARY:');
  
  for (const result of results) {
    const needsFix = !result.hasChatSend && result.hasAIFunction;
    console.log(`\n${result.featureName}:`);
    if (needsFix) {
      console.log('  ❌ NEEDS FIX - Has AI feature but not using /api/chat/send');
    } else if (result.hasChatSend) {
      console.log('  ✅ Already using correct endpoint');
    } else {
      console.log('  ⚠️  No AI feature detected');
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
