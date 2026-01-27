import { Bot } from 'grammy';

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in environment variables');
}

// Create bot instance
export const bot = new Bot(BOT_TOKEN);

// Command: /start
bot.command('start', async (ctx) => {
  const webAppUrl = process.env.WEBAPP_URL || 'http://localhost:5173';

  await ctx.reply(
    '🛒 Добро пожаловать в Shopping List!\n\n' +
    'Создавайте списки покупок и делитесь ими с друзьями и семьёй.\n\n' +
    'Нажмите кнопку ниже, чтобы открыть приложение:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📝 Открыть Shopping List',
              web_app: { url: webAppUrl },
            },
          ],
        ],
      },
    }
  );
});

// Command: /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    '📖 Помощь по Shopping List:\n\n' +
    '/start - Начать работу\n' +
    '/help - Показать эту справку\n\n' +
    'Используйте кнопку "Открыть Shopping List" для создания и управления списками.'
  );
});

// Handle errors
bot.catch((err) => {
  console.error('Bot error:', err);
});
