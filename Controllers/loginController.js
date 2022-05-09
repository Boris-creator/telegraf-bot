const { getMessage } = require('telegraf-router')
const { sequelize } = require('../sequelize')
const { QueryTypes } = require('sequelize');
const argon2 = require('argon2')

const indexLogin = async ({ ctx }) => {
  await ctx.reply("Введите Email или телефон организации");
  return true;
}

const handlerLogin = async ({ ctx, params, router }) => {
  const answer = getMessage(ctx).text;
  if (ctx.session.login_email == null) {
    ctx.session.login_email = answer;
    await ctx.reply("Введите пароль");
  } else if (ctx.session.login_password == null) {
    ctx.session.login_password = answer;
    let user = await sequelize.query(
      `SELECT * FROM clients WHERE mail = '${ctx.session.login_email}' OR phone = '${ctx.session.login_phone}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
    if (user[0]) {
      const password_correct = await argon2.verify(
        user[0].password,
        ctx.session.login_password
      );
      if (!password_correct) {
        user = [];
      }
    }
    let admin = await sequelize.query(
      `SELECT * FROM clients WHERE mail = '${ctx.session.login_email}' OR phone = '${ctx.session.login_phone}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
    if (admin[0]) {
      const password_correct = await argon2.verify(
        admin[0].password,
        ctx.session.login_password
      );
      if (!password_correct) {
        admin = [];
      }
    }
    ctx.session.login_email = null;
    ctx.session.login_password = null;
    [user] = user;
    [admin] = admin;
    if (user) {
      ctx.session.userId = user.id;
      ctx.session.fio = user.fio;
      await ctx.reply(`Здравствуйте${user.fio ? ", " + user.fio : ""}`);
      await router.redirect("/client", ctx);
    } else if (admin) {
      ctx.session.userId = admin.id;
      await router.redirect("/admin", ctx);
    } else {
      await ctx.reply("Неверные данные");
      await router.redirect("/start_screen", ctx);
    }
  }
}

module.exports = { indexLogin, handlerLogin }
