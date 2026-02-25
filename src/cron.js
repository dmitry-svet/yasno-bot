const cron = require('node-cron');
const { fetchSchedule } = require('./api');
const { getSchedule, saveSchedule, getUsers, removeUser } = require('./store');
const { findChanges } = require('./compare');
const { formatChangeNotification } = require('./format');

async function checkForUpdates(bot) {
  console.log('Checking for schedule updates...');

  const newData = await fetchSchedule();
  const stored = getSchedule();
  const oldData = stored?.data || null;

  const changes = findChanges(oldData, newData);
  saveSchedule(newData);

  const changedGroups = Object.keys(changes);
  if (changedGroups.length === 0) {
    console.log('No changes detected');
    return;
  }

  console.log(`Changes detected in groups: ${changedGroups.join(', ')}`);

  const users = getUsers();
  for (const [chatId, user] of Object.entries(users)) {
    if (!changes[user.group]) continue;

    const message = formatChangeNotification(user.group, newData[user.group], oldData?.[user.group]);
    try {
      await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (err) {
      if (err.response?.statusCode === 403) {
        console.log(`User ${chatId} blocked the bot, removing`);
        removeUser(chatId);
      } else {
        console.error(`Failed to notify ${chatId}:`, err.message);
      }
    }
  }
}

function startCron(bot) {
  const schedule = process.env.CRON_SCHEDULE || '*/15 * * * *';

  cron.schedule(schedule, () => {
    checkForUpdates(bot).catch(err => console.error('Cron error:', err));
  });

  setTimeout(() => {
    checkForUpdates(bot).catch(err => console.error('Initial check error:', err));
  }, 5000);

  console.log(`Cron scheduled: ${schedule}`);
}

module.exports = { startCron };
