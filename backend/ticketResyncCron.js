const cron = require('node-cron');
const { exec } = require('child_process');
require('dotenv').config();

// Schedule: every hour (change as needed)
cron.schedule('*/30 * * * *', () => {
  console.log('Running ticket resync job...');
  exec(`node backend/resyncTickets.js`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Resync error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Resync stderr: ${stderr}`);
      return;
    }
    console.log(`Resync output: ${stdout}`);
  });
});

console.log('Ticket resync cron job scheduled.');
