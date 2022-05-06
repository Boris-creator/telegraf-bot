const { Telegraf, Markup } = require("telegraf");
const { Router } = require("telegraf-router");

const LocalSession = require("telegraf-session-local");
const { sequelize } = require("./sequelize.js");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);
//
bot.use(new LocalSession({}).middleware());
/*
bot.hears("hi", (ctx) => {
  ctx.reply(666);
});
bot.command("hi", (ctx) =>
  ctx.reply(
    "Чем могу помочь?",
    Markup.keyboard(require("./markup/mainMenu")).oneTime().resize()
  )
);
*/
const router = new Router({
  bot,
  routes: require("./router.js"),
  errorCb: ({ ctx }) => {
      console.log(`Error, support: @name`);
  }
});
bot.hears("Зарегистрироваться", (ctx)=>{ctx.session.routerPath = "/form/register"; router.resolve(ctx)})
bot.hears("Войти", (ctx)=>{ctx.session.routerPath = "/form/login"; router.resolve(ctx)})
bot.hears("Отменить регистрацию", (ctx)=>{ctx.session.routerPath = "/form/register/cancel"; router.resolve(ctx)})
bot.hears("Назад", (ctx)=>{ctx.session.routerPath = "/form/register/back"; router.resolve(ctx)})
bot.hears("Пропустить", (ctx)=>{ctx.session.routerPath = "/form/register/omit"; router.resolve(ctx)})
bot.hears("Мои контактные данные", (ctx)=>{ctx.session.routerPath = "/client/contacts"; router.resolve(ctx)})



async function main() {
  await sequelize.sync();
  bot.launch();
}
main();
