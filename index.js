const { Telegraf } = require("telegraf");
const { Router } = require("telegraf-router");
const addCollaborators = require("./methods/addCollaborator")

const LocalSession = require("telegraf-session-local");
const { sequelize } = require("./sequelize.js");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(new LocalSession({}).middleware());
const router = new Router({
  bot,
  routes: require("./router"),
  errorCb: ({ ctx }) => {
      console.log(`Error, support: @name`);
  }
});

async function main() {
  await sequelize.sync();
  await addCollaborators();
  bot.launch();
}
main();
