const { Markup } = require('telegraf')
const controllers = require('../methods')

const indexClient = async ({ ctx, router }) => {
  const { fio } = ctx.session;
  await ctx.reply("Выберите действие", {
    reply_markup: {
      remove_keyboard: true,
      keyboard: [
        [Markup.button.callback('Прайс-лист')],
        [Markup.button.callback('Мои контактные данные')],
        [Markup.button.callback('Контактные данные организации')],
        [Markup.button.callback('Выйти')],
      ],
    },
  });
  return true;
}

const handlerClient = async ({ ctx, router }) => {
  const text = ctx.update.message.text;
  if (text === 'Выйти') {
    delete ctx.session.fio;
    delete ctx.session.userId;
    await router.redirect('/select-action', ctx);
  }
  if (text === 'Мои контактные данные') {
    await router.redirect('/client/contacts', ctx);
  }
}


const clientContactsIndex = async ({ ctx, router }) => {
  const data = await controllers.getUserData({
    id: ctx.session.userId,
  });
  await ctx.reply('Для изменения данных...');
  ctx.reply(JSON.stringify(data), {
    reply_markup: {
      keyboard: [
        [
          Markup.button.callback(
            'Начать изменение контактных данных'
          ),
        ],
        [Markup.button.callback('Назад')],
      ],
    },
  });
}

const clientContactsHandler = async ({ ctx, router }) => {
  if (ctx.update.message.text === 'Начать изменение контактных данных') {
    await router.redirect('/client/contacts/change', ctx);
  }
  if (ctx.update.message.text === 'Назад') {
    await router.redirect('/client', ctx);
  }
  return true;
}

const clientContactsChangeIndex = async ({ ctx }) => {
  ctx.reply(
    "Вводите данные в формате ключ: значение через запятую",
    {
      reply_markup: {
        keyboard: [
          [Markup.button.callback("Отменить изменение")],
        ],
      },
    }
  );
}


const clientContactsChangeHandler = async ({ ctx, router }) => {
  const text = ctx.update.message.text;
  if (text === 'Отменить изменение') {
    await router.redirect("/client", ctx);
    return;
  }
  const data = text
    .split(",")
    .map((part) =>
      part.split(":").map((_) => _.trim().toLowerCase())
    );
  const client = await controllers.changeUserData(
    Object.fromEntries(data),
    ctx.session.userId
  );
  console.log(client);
  if (client) {
    await ctx.reply('Данные были успешно изменены.');
    await router.redirect('/client', ctx);
  } else {
    await ctx.reply('Введите корректные данные.');
  }
}

module.exports = { indexClient, handlerClient, clientContactsIndex, clientContactsHandler, clientContactsChangeIndex,
                   clientContactsChangeHandler }
