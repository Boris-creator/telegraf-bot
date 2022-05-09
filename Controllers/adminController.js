const { Markup } = require('telegraf')
const { parse } = require("./utils/parse");
const controllers = require("./methods");

const indexAdmin = async ({ ctx }) => {
  await ctx.reply("Чем могу помочь?", {
    reply_markup: {
      keyboard: [
        [Markup.button.callback('Смотреть заявки')],
        [Markup.button.callback('Рассылка')],
        [Markup.button.callback('Просмотр клиентов')],
        [Markup.button.callback('Выйти')],
      ],
    },
  });
}

const handlerAdmin = async ({ ctx, router }) => {
  const text = ctx.update.message.text;
  if (text === 'Смотреть заявки') {
    await router.redirect("/admin/unverified", ctx);
  }
  if (text === 'Просмотр клиентов') {
    await router.redirect("/admin/clients", ctx);
  }
  if (text === 'Выйти') {
    delete ctx.session.adminId;
    await router.redirect("/select-action", ctx);
  }
}

const adminUnverifiedIndex = async ({ ctx }) => {
  const clients = await controllers.getUsers({ verified: false });
  const keyboard = [[Markup.button.callback("Назад")]];
  if (clients.length) {
    keyboard.unshift(
      [Markup.button.callback("Внести клиента")],
      [Markup.button.callback("Удалить заявку")]
    );
  }
  await ctx.reply(JSON.stringify(clients), {
    reply_markup: {
      keyboard,
    },
  });
}

const adminUnverifiedHandler = async ({ ctx, router }) => {
  const text = ctx.update.message.text;
  if (text === 'Внести клиента') {
    router.redirect('/admin/unverified/verify', ctx);
  }
  if (text === 'Удалить заявку') {
    router.redirect('/admin/unverified/delete', ctx);
  }
  if (text === 'Назад') {
    router.redirect('/admin', ctx);
  }
}

const adminUnverifiedVerifyIndex = async ({ ctx }) => {
  ctx.reply("Вводите данные в формате ключ: значение")
}

const adminUnverifiedVerifyHandler = async ({ ctx }) => {
  const data = parse(ctx.update.message.text);
  const user = await controllers.getUsers(data, false);
  if (user) {
    const updated = await controllers.changeUserData(
      { verified: true },
      user.id
    );
    await ctx.reply("Заявка одобрена.");
  } else {
    await ctx.reply("Заявка не найдена.");
  }
}

const adminUnverifiedDeleteIndex = async ({ ctx }) => {
  ctx.reply("Вводите данные в формате ключ: значение");
}

const adminUnverifiedDeleteHandler = async ({ ctx, router }) => {
  const data = parse(ctx.update.message.text);
  const user = await controllers.deleteUser(data);
  if (user) {
    await ctx.reply("Заявка удалена.");
  } else {
    await ctx.reply("Заявка не найдена.");
  }
}




module.exports = { indexAdmin, handlerAdmin, adminUnverifiedIndex, adminUnverifiedHandler,
                    adminUnverifiedVerifyIndex, adminUnverifiedVerifyHandler, adminUnverifiedDeleteIndex,
                    adminUnverifiedDeleteHandler }
