require('dotenv').config();
const { startBot } = require('./bot');
const { startCron } = require('./cron');
const { getUsers } = require('./store');

const bot = startBot();
startCron(bot);

const dataDir = process.env.DATA_DIR || './data';
const users = getUsers();
const userCount = Object.keys(users).length;
console.log(`yasno-bot started | DATA_DIR=${dataDir} | users: ${userCount}`);
