#!/usr/bin/env node

console.log('🚀 Triggering GitHub deployment via API...');
console.log('');

// Call the local API endpoint
const apiUrl = 'http://localhost:3000/api/deploy-to-github';

try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  console.log('Response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log('');
    console.log('✅ SUCCESS! Files pushed to GitHub:');
    data.results.forEach(r => {
      if (r.success) {
        console.log(`  ✅ ${r.file} (commit: ${r.commit.substring(0, 7)})`);
      } else {
        console.log(`  ❌ ${r.file}: ${r.error}`);
      }
    });
    console.log('');
    console.log('🚀 GitHub Actions deploying now!');
    console.log(`🔗 ${data.deploymentUrl}`);
    console.log(`🌐 ${data.liveUrl}`);
  } else {
    console.error('❌ Deployment failed');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
