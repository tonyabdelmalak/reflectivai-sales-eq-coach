#!/usr/bin/env node

// Simple deployment script that calls the local API
const API_URL = 'http://localhost:3000/api/deploy-to-github';

console.log('🚀 Deploying to GitHub...');
console.log('');

fetch(API_URL, { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    console.log('✅ Response received:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('');
      console.log('🎉 SUCCESS! Pushed to GitHub!');
      console.log(`📊 ${data.successCount}/${data.total} files pushed`);
      console.log('');
      console.log('🔗 Check deployment:');
      console.log(data.deploymentUrl);
      console.log('');
      console.log('🌐 Live site:');
      console.log(data.liveUrl);
    } else {
      console.error('❌ Deployment failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
