const { getCBData, getMessage } = require("telegraf-router");
const { Markup } = require("telegraf");
const controllers = require("./methods");
const argon2 = require("argon2");
const { sequelize } = require("./sequelize");
const { QueryTypes} = require("sequelize")
const registration_steps = [
  {
    title: "ogrn",
    allowNull: true,
    message: "Введите ОГРН",
  },
  {
    title: "inn",
    allowNull: "ogrn",
    message: "Введите ИНН",
  },
  {
    title: "phone",
    allowNull: true,
    message: "Введите телефон организации",
  },
  {
    title: "mail",
    allowNull: "phone",
    message: "Введите почту организации",
  },
  {
    title: "phone_personal",
    allowNull: true,
    message: "Введите контактный телефон",
  },
  {
    title: "mail_personal",
    allowNull: "phone_personal",
    message: "Введите контактную почту",
  },
  {
    title: "fio",
    allowNull: false,
    message: "Введите ФИО",
  },
  {
    title: "password",
    allowNull: false,
    message: "Введите пароль",
  },
];
const register_routes = [
  {
    children: [
      {
        path: "",
        action: async function RegisterScene({ ctx, params, router }) {
          await router.redirect("/form/register/ogrn", ctx);
          return true;
        },
      },
      {
        path: "/:title/message",
        action: async function RegisterScene({ ctx, params, router }) {
          const stepIndex = registration_steps.findIndex(
            (s) => s.title == params.title
          );
          if (stepIndex == -1) {
            return;
          }
          const answer = getMessage(ctx).text;
          if (answer == "Отменить регистрацию") {
            await router.redirect("/form/register/cancel", ctx);
            return;
          }
          if (answer == "Назад") {
            await router.redirect("/form/register/back", ctx);
            return;
          }
          if (answer == "Пропустить") {
            await router.redirect("/form/register/omit", ctx);
            return;
          }
          const step = ctx.session.step;
          if (!step) {
            return;
          }
          ctx.session[step] = answer;
          const nextStep = registration_steps[stepIndex + 1];
          if (!nextStep) {
            ctx.session.step = null;
            await router.redirect("/form/register/submit", ctx);
            return;
          }
          ctx.session.step = nextStep.title;
          await router.redirect("/form/register/" + nextStep.title, ctx);
        },
      },
      {
        path: "/:title",
        action: async function ({ ctx, params, router }) {
          const stepIndex = registration_steps.findIndex(
            (s) => s.title == params.title
          );
          if (stepIndex == -1) {
            return;
          }
          const { title, allowNull, message } = registration_steps[stepIndex];
          ctx.session.step = title;
          const keyboard = [
            [Markup.button.callback("Отменить регистрацию", "")],
          ];

          if (stepIndex !== 0) {
            keyboard.unshift(["Назад"]);
          }
          console.log(ctx.session[allowNull]);
          if (allowNull === true || ctx.session[allowNull]) {
            keyboard.unshift([Markup.button.callback("Пропустить", "")]);
          }
          await ctx.reply(message, {
            reply_markup: {
              remove_keyboard: true,
              keyboard,
            },
          });
          return true;
        },
      },
      {
        path: "/cancel",
        action: async function CancelScene({ ctx, params, router }) {
          await router.redirect("select-action", ctx);
          return true;
        },
      },
      {
        path: "/back",
        action: async function ({ ctx, params, router }) {
          const stepIndex = registration_steps.findIndex(
              (s) => s.title == ctx.session.step
            ),
            previous = registration_steps[stepIndex - 1];
          await router.redirect("/form/register/" + previous.title, ctx);
        },
      },
      {
        path: "/omit",
        action: async function ({ ctx, params, router }) {
          ctx.session[ctx.session.step] = null;
          const stepIndex = registration_steps.findIndex(
              (s) => s.title == ctx.session.step
            ),
            nextStep = registration_steps[stepIndex + 1];
          if (nextStep) {
            await router.redirect("/form/register/" + nextStep.title, ctx);
          } else {
            await router.redirect("/form/register/submit", ctx);
          }
        },
      },
      {
        path: "/submit",
        action: async function ({ ctx, params, router }) {
          const {
            inn,
            ogrn,
            phone,
            mail,
            phone_personal,
            mail_personal,
            fio,
            password,
          } = ctx.session;
          const result = await controllers.addUser({
            inn,
            ogrn,
            phone,
            mail,
            phone_personal,
            mail_personal,
            fio,
            password,
            verified: false,
          });
          console.log(88888, result)
          if (result) {
            ctx.session.userId = result.id;
            router.redirect("/client", ctx);
          } else {
            await ctx.reply("Недостаточно информации или некорректные данные");
            router.redirect("/select-action", ctx);
          }
        },
      },
    ],
  },
];
const login_routes = [
  {
    children: [
      {
        path: "",
        action: async function ({ ctx }) {
          await ctx.reply("Введите Email или телефон организации");
          return true;
        },
      },
      {
        path: "/message",
        action: async function ({ ctx, params, router }) {
          const answer = getMessage(ctx).text;
          if (ctx.session.login_email == null) {
            ctx.session.login_email = answer;
            await ctx.reply("Введите пароль");
          } else if (ctx.session.login_password == null) {
            ctx.session.login_password = answer;
            let user = await sequelize.query(`SELECT * FROM clients WHERE mail = '${ctx.session.login_email}' OR phone = '${ctx.session.login_phone}'`,
            {
              type: QueryTypes.SELECT
            })
            if (user[0]) {
              const password_correct = await argon2.verify(
                user[0].password,
                ctx.session.login_password
              );
              if (!password_correct) {
                user = [];
              }
            }
            ctx.session.login_email = null;
            ctx.session.login_password = null;
            [user] = user;
            if (user) {
              ctx.session.userId = user.id;
              ctx.session.fio = user.fio;
              await router.redirect("/client", ctx);
            } else {
              await ctx.reply("Неверные данные");
              await router.redirect("/select-action", ctx);
            }
          }
        },
      },
    ],
  },
];
const client_routes = [
  {
    children: [
      {
        path: "",
        action: async function ({ ctx, params, router }) {
          const { fio } = ctx.session;
          await ctx.reply(`Здравствуйте${fio ? ", " + fio : ""}`, {
            reply_markup: {
              remove_keyboard: true,
              keyboard: [
                [Markup.button.callback("Прайс-лист")],
                [Markup.button.callback("Мои контактные данные")],
                [Markup.button.callback("Контактные данные организации")],
                [Markup.button.callback("Выйти")],
              ],
            },
          });
          return true;
        },
      },
      {
        path: "/message",
        action: async ({ ctx, router }) => {
          if (ctx.update.message.text == "Выйти") {
            delete ctx.session.fio;
            delete ctx.session.userId;
            await router.redirect("/select-action", ctx);
          }
        },
      },
      {
        path: "/contacts",
        children: [
          {
            path: "",
            action: async ({ ctx, router }) => {
              const data = await controllers.getUserData({
                id: ctx.session.userId,
              });
              await ctx.reply("Для изменения данных...");
              ctx.reply(JSON.stringify(data), {
                reply_markup: {
                  //remove_keyboard: true,
                  keyboard: [
                    [
                      Markup.button.callback(
                        "Начать изменение контактных данных"
                      ),
                    ],
                    [Markup.button.callback("Назад")],
                  ],
                },
              });
            },
          },
          {
            path: "/message",
            action: async ({ ctx, router }) => {
              if (
                ctx.update.message.text == "Начать изменение контактных данных"
              ) {
                await router.redirect("/client/contacts/change", ctx);
              }
              return true;
            },
          },
          {
            path: "/change",
            action: async ({ ctx }) => {
              ctx.reply(77, {
                reply_markup: {
                  keyboard: [
                    [Markup.button.callback("Пропустить")],
                    [Markup.button.callback("Назад")],
                    Markup.button.callback("Отменить изменение"),
                  ],
                },
              });
            },
          },
        ],
      },
    ],
  },
];
const routes = [
  {
    path: "start",
    action: async function StartScene({ ctx, params, router }) {
      await router.redirect("/select-action", ctx);
      return true;
    },
  },
  {
    path: "/select-action",
    children: [
      {
        path: "",
        action: async function StartScene({ ctx, params, router }) {
          await ctx.reply("Please select action:", {
            reply_markup: {
              remove_keyboard: true,
              keyboard: [
                [Markup.button.callback("Войти", "register")],
                [Markup.button.callback("Зарегистрироваться", "register")],
              ],
            },
          });
          return true;
        },
      },
      {
        path: "/message",
        action: async function ({ ctx, params, router }) {
          if (ctx.update.message.text == "Зарегистрироваться") {
            await router.redirect("/form/register", ctx);
          }
          if (ctx.update.message.text == "Войти") {
            await router.redirect("/form/login", ctx);
          }
        },
      },
    ],
  },
  {
    path: "/form",
    children: [
      {
        path: "/register",
        children: register_routes,
      },
      {
        path: "/login",
        children: login_routes,
      },
    ],
  },
  {
    path: "/client",
    children: client_routes,
  },
];

module.exports = routes;
