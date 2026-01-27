import { Bot, Context, InlineKeyboard } from 'grammy';
import { getUserLists, createList, getListWithItems } from './lib/supabase.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in environment variables');
}

// Create bot instance
export const bot = new Bot(BOT_TOKEN);

// Store user states for /newlist command
const userStates = new Map<number, string>();

// Command: /start
bot.command('start', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp('📝 Открыть приложение', WEBAPP_URL);

  await ctx.reply(
    '🛒 *Добро пожаловать в Shopping List\\!*\n\n' +
    'Создавайте списки покупок и делитесь ими с друзьями и семьёй\\.\n\n' +
    '*Команды:*\n' +
    '• /newlist \\- быстро создать новый список\n' +
    '• /mylists \\- показать все ваши списки\n' +
    '• /help \\- справка по командам\n\n' +
    'Или откройте приложение кнопкой ниже:',
    {
      reply_markup: keyboard,
      parse_mode: 'MarkdownV2',
    }
  );
});

// Command: /newlist
bot.command('newlist', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  userStates.set(userId, 'awaiting_list_name');

  await ctx.reply(
    '📝 Создание нового списка\n\n' +
    'Отправьте название списка (например: "Продукты на неделю")',
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
});

// Command: /mylists
bot.command('mylists', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.reply('Ошибка: не удалось определить пользователя');
    return;
  }

  try {
    const lists = await getUserLists(userId);

    if (lists.length === 0) {
      await ctx.reply(
        '📝 У вас пока нет списков\n\n' +
        'Используйте /newlist чтобы создать первый список, ' +
        'или откройте приложение через меню.'
      );
      return;
    }

    // Create inline keyboard with lists
    const keyboard = new InlineKeyboard();

    for (const list of lists) {
      const listUrl = `${WEBAPP_URL}/list/${list.id}`;
      keyboard
        .webApp(`📋 ${list.name}`, listUrl)
        .row();
    }

    // Add button to open main app
    keyboard.webApp('➕ Открыть приложение', WEBAPP_URL);

    await ctx.reply(
      `📚 *Ваши списки* \\(${lists.length}\\)\n\n` +
      'Нажмите на список чтобы открыть его:',
      {
        reply_markup: keyboard,
        parse_mode: 'MarkdownV2',
      }
    );
  } catch (error) {
    console.error('Error fetching lists:', error);
    await ctx.reply('❌ Ошибка при загрузке списков. Попробуйте позже.');
  }
});

// Command: /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    '📖 *Справка по Shopping List*\n\n' +
    '*Команды:*\n' +
    '• /start \\- начать работу с ботом\n' +
    '• /newlist \\- создать новый список\n' +
    '• /mylists \\- показать все ваши списки\n' +
    '• /help \\- показать эту справку\n\n' +
    '*Как использовать:*\n' +
    '1\\. Создайте список через /newlist или в приложении\n' +
    '2\\. Добавляйте товары\n' +
    '3\\. Отмечайте купленные товары галочкой\n' +
    '4\\. Делитесь списками с друзьями\n\n' +
    'Все данные синхронизируются между устройствами в реальном времени\\!',
    {
      parse_mode: 'MarkdownV2',
    }
  );
});

// Handle text messages (for /newlist flow)
bot.on('message:text', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const userState = userStates.get(userId);

  if (userState === 'awaiting_list_name') {
    const listName = ctx.message.text.trim();

    if (!listName) {
      await ctx.reply('Название не может быть пустым. Попробуйте ещё раз:');
      return;
    }

    try {
      const newList = await createList(userId, listName);
      userStates.delete(userId);

      const listUrl = `${WEBAPP_URL}/list/${newList.id}`;
      const keyboard = new InlineKeyboard()
        .webApp('📝 Открыть список', listUrl)
        .row()
        .webApp('📚 Все списки', WEBAPP_URL);

      await ctx.reply(
        `✅ Список "${listName}" создан!\n\n` +
        'Откройте его чтобы добавить товары:',
        {
          reply_markup: keyboard,
        }
      );
    } catch (error) {
      console.error('Error creating list:', error);
      await ctx.reply('❌ Ошибка при создании списка. Попробуйте позже.');
      userStates.delete(userId);
    }
  }
});

// Handle errors
bot.catch((err) => {
  console.error('Bot error:', err);
});
