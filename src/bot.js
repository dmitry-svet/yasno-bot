const TelegramBot = require('node-telegram-bot-api');
const { setUser, getUsers, getSchedule } = require('./store');
const { formatSchedule } = require('./format');

const GROUPS = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2'];

function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    process.exit(1);
  }

  const bot = new TelegramBot(token, { polling: true });

  bot.setMyCommands([
    { command: 'status', description: 'Show current schedule' },
    { command: 'setgroup', description: 'Choose your blackout group' },
    { command: 'help', description: 'List commands' },
  ]);

  const mainKeyboard = {
    reply_markup: {
      keyboard: [[{ text: '/status' }, { text: '/setgroup' }]],
      resize_keyboard: true,
    },
  };

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
      'Welcome to Yasno Schedule Bot!\n\n' +
      'I monitor the Yasno electricity blackout schedule and notify you when it changes.\n\n' +
      'Use /setgroup to pick your group, then I\'ll send you updates automatically.',
      mainKeyboard
    );
  });

  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id,
      'Commands:\n' +
      '/setgroup — choose your blackout group\n' +
      '/status — show current schedule for your group\n' +
      '/help — show this message'
    );
  });

  bot.onText(/\/setgroup/, (msg) => {
    const keyboard = [];
    for (let i = 0; i < GROUPS.length; i += 2) {
      keyboard.push([
        { text: GROUPS[i], callback_data: GROUPS[i] },
        { text: GROUPS[i + 1], callback_data: GROUPS[i + 1] },
      ]);
    }

    bot.sendMessage(msg.chat.id, 'Choose your blackout group:', {
      reply_markup: { inline_keyboard: keyboard },
    });
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const group = query.data;

    if (!GROUPS.includes(group)) return;

    setUser(chatId, group);
    bot.answerCallbackQuery(query.id);
    bot.sendMessage(chatId, `Group set to ${group}. You'll be notified when the schedule changes.`);

    const stored = getSchedule();
    if (stored?.data?.[group]) {
      bot.sendMessage(chatId, formatSchedule(group, stored.data[group]), { parse_mode: 'HTML' });
    }
  });

  bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    const users = getUsers();
    const user = users[chatId];

    if (!user) {
      bot.sendMessage(chatId, 'You haven\'t set a group yet. Use /setgroup to choose one.');
      return;
    }

    const stored = getSchedule();
    if (!stored?.data?.[user.group]) {
      bot.sendMessage(chatId, 'No schedule data available yet. It will be fetched shortly.');
      return;
    }

    bot.sendMessage(chatId, formatSchedule(user.group, stored.data[user.group]), { parse_mode: 'HTML' });
  });

  console.log('Bot started in polling mode');
  return bot;
}

module.exports = { startBot };
