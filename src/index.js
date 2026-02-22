require('dotenv').config();
const { startBot } = require('./bot');
const { startCron } = require('./cron');

const bot = startBot();
startCron(bot);

console.log('yasno-bot started');
