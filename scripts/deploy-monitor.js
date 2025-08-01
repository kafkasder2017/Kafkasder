#!/usr/bin/env node

const { Vercel } = require('@vercel/sdk');

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN || 'Q6s7u39j25K3eipLl35BLstr',
});

async function monitorDeployment() {
  try {
    console.log('🔍 Monitoring Vercel deployment...');
    
    // Get latest deployments
    const deployments = await vercel.deployments.getDeployments({
      limit: 5,
      target: 'production'
    });
    
    if (deployments.length > 0) {
      const latestDeployment = deployments[0];
      
      console.log(`📊 Deployment Status: ${latestDeployment.readyState}`);
      console.log(`🌐 URL: ${latestDeployment.url}`);
      console.log(`⏰ Created: ${new Date(latestDeployment.created).toLocaleString()}`);
      console.log(`🎯 Target: ${latestDeployment.target}`);
      
      if (latestDeployment.readyState === 'READY') {
        console.log('✅ Deployment successful!');
        return latestDeployment.url;
      } else if (latestDeployment.readyState === 'ERROR') {
        console.log('❌ Deployment failed!');
        process.exit(1);
      } else {
        console.log('⏳ Deployment in progress...');
      }
    } else {
      console.log('📭 No deployments found');
    }
  } catch (error) {
    console.error('❌ Error monitoring deployment:', error.message);
    process.exit(1);
  }
}

// Run monitoring
monitorDeployment(); 