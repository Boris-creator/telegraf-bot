const { Telegraf, Markup } = require("telegraf");
const { Router } = require("telegraf-router");
const addCollaborators = require("./methods/addCollaborator")

const LocalSession = require("telegraf-session-local");
const { sequelize } = require("./sequelize.js");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);
//
bot.use(new LocalSession({}).middleware());
const router = new Router({
  bot,
  routes: require("./router.js"),
  errorCb: ({ ctx }) => {
      console.log(`Error, support: @name`);
  }
});
//bot.hears("command", (ctx)=>{ctx.session.routerPath = "path"; router.resolve(ctx)}) //example
function test(ctx, next){
  console.log(ctx.updateType)
  return next()
}
bot.use(test)

async function main() {
  await sequelize.sync();
  await addCollaborators();
  bot.launch();
}
main();
