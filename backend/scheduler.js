const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');

console.log('Scheduler started. Sync job is scheduled to run every hour.');

// Schedule the shopifySync.js script to run every hour
cron.schedule('0 * * * *', () => {
  console.log(`[${new Date().toISOString()}] Running hourly Shopify data sync...`);

  const syncProcess = exec('node shopifySync.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`[${new Date().toISOString()}] Error executing sync script: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`[${new Date().toISOString()}] Sync script stderr: ${stderr}`);
    }
    console.log(`[${new Date().toISOString()}] Sync script stdout: ${stdout}`);
    console.log(`[${new Date().toISOString()}] Hourly Shopify data sync finished successfully.`);
  });
});