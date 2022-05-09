const { Markup } = require('telegraf')

const start = async ({ctx, router}) => {
  await router.redirect(
    ctx.session.userId
      ? "/client"
      : ctx.session.adminId
      ? "/admin"
      : "/select-action",
    ctx
  );
}

const startScreen = async ({ ctx }) => {
  await ctx.reply('Чем могу помочь?', {
    reply_markup: {
      remove_keyboard: true,
      keyboard: [
        [Markup.button.callback('Войти', 'register')],
        [Markup.button.callback('Зарегистрироваться', 'register')],
      ],
    },
  });
}

const authRedirect = async ({ ctx, router }) => {
  if (ctx.update.message.text === 'Зарегистрироваться') {
    await router.redirect('/form/register', ctx);
  }
  if (ctx.update.message.text === 'Войти') {
    await router.redirect('/form/login', ctx);
  }
}

module.exports = { start, startScreen, authRedirect }
