const { getMessage } = require('telegraf-router')
const registrationSteps = require('../assets/registrationSteps')
const { Markup } = require('telegraf')
const controllers = require('../methods')

const indexRegister = async ({ ctx, router}) => {
  await router.redirect("/form/register/ogrn", ctx);
  return true;
}

const registerRedirectStep = async ({ ctx, params, router }) => {
  const stepIndex = registrationSteps.findIndex(
    (s) => s.title === params.title
  );
  if (stepIndex === -1) {
    return;
  }
  const answer = getMessage(ctx).text;
  if (answer === 'Отменить регистрацию') {
    await router.redirect('/form/register/cancel', ctx);
    return;
  }
  if (answer === 'Назад') {
    await router.redirect('/form/register/back', ctx);
    return;
  }
  if (answer === 'Пропустить') {
    await router.redirect('/form/register/omit', ctx);
    return;
  }
  const step = ctx.session.step;
  if (!step) {
    return;
  }
  const currentStep = registrationSteps[stepIndex];
  if (currentStep.validate && !currentStep.validate.test(answer)) {
    await ctx.reply('Некорректные данные. ' + currentStep.message);
    return;
  }
  ctx.session[step] = answer;
  const nextStep = registrationSteps[stepIndex + 1];
  if (!nextStep) {
    ctx.session.step = null;
    await router.redirect('/form/register/submit', ctx);
    return;
  }
  ctx.session.step = nextStep.title;
  await router.redirect('/form/register/' + nextStep.title, ctx);
}

const registerStep = async ({ctx, params}) => {
  const stepIndex = registrationSteps.findIndex(
    (s) => s.title === params.title
  );
  if (stepIndex === -1) {
    return;
  }
  const { title, allowNull, message } = registrationSteps[stepIndex];
  ctx.session.step = title;
  const keyboard = [
    [Markup.button.callback('Отменить регистрацию', '')],
  ];

  if (stepIndex !== 0) {
    keyboard.unshift(["Назад"]);
  }
  console.log(ctx.session[allowNull]);
  if (allowNull === true || ctx.session[allowNull]) {
    keyboard.unshift([Markup.button.callback('Пропустить', '')]);
  }
  await ctx.reply(message, {
    reply_markup: {
      remove_keyboard: true,
      keyboard,
    },
  });
  return true;
}

const cancelRegister = async ({ ctx, router }) => {
  await router.redirect("/start_screen", ctx);
  return true;
}

const backRegister = async ({ ctx, router }) => {
  const stepIndex = registrationSteps.findIndex((s) => s.title === ctx.session.step),
    previous = registrationSteps[stepIndex - 1];
  await router.redirect("/form/register/" + previous.title, ctx);
}

const omitRegister = async ({ ctx, router }) => {
  ctx.session[ctx.session.step] = null;
  const stepIndex = registrationSteps.findIndex((s) => s.title === ctx.session.step),
    nextStep = registrationSteps[stepIndex + 1];
  if (nextStep) {
    await router.redirect("/form/register/" + nextStep.title, ctx);
  } else {
    await router.redirect("/form/register/submit", ctx);
  }
}

const submitRegister = async ({ ctx, router }) => {
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
  if (result) {
    ctx.session.userId = result.id;
    await ctx.reply(`Здравствуйте${fio ? ", " + fio : ""}`);

    router.redirect("/client", ctx);
  } else {
    await ctx.reply("Недостаточно информации или некорректные данные");
    router.redirect("/start_screen", ctx);
  }
}

module.exports = { indexRegister, registerRedirectStep, registerStep, cancelRegister, backRegister, omitRegister,
  submitRegister }
