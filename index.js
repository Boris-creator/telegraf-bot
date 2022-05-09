const { Telegraf, Markup } = require("telegraf");
const { Router } = require("telegraf-router");

const LocalSession = require("telegraf-session-local");
const { sequelize } = require("./sequelize.js");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(new LocalSession({}).middleware());
const router = new Router({
  bot,
  routes: require("./router.js"),
  errorCb: ({ ctx }) => {
      console.log(`Error, support: @name`);
  }
});

async function main() {
  await sequelize.sync();
  bot.launch();
}
main();
