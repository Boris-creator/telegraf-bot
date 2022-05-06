const { getCBData, getMessage } = require("telegraf-router");
const { Markup } = require("telegraf");
const controllers = require("./methods");
const registration_steps = [
  {
    title: "ogrn",
    allowNull: true,
    message: "Введите ОГРН",
  },
  {
    title: "inn",
    allowNull: true,
    message: "Введите ИНН",
  },
  {
    title: "phone",
    allowNull: true,
    message: "Введите телефон организации",
  },
  {
    title: "mail",
    allowNull: false,
    message: "Введите почту организации",
  },
  {
    title: "phone_personal",
    allowNull: false,
    message: "Введите контактный телефон",
  },
  {
    title: "mail_personal",
    allowNull: false,
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
          await router.redirect("/form/register/inn", ctx);
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
          if (
            ["Отменить регистрацию", "Назад", "Пропустить"].includes(answer)
          ) {
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
          if (allowNull) {
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
          controllers.addUser({ ...ctx.session, verified: false });
          router.redirect("/client", ctx);
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
          await ctx.reply("Введите Email организации");
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
            const user = await controllers.getUserData({
              mail: ctx.session.login_email,
              password: ctx.session.login_password,
            });
            ctx.session.login_email = null;
            ctx.session.login_password = null;
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
      await router.redirect("select-action", ctx);
      return true;
    },
  },
  {
    path: "select-action",
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
