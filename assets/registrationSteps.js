const validation = require('./validation')

module.exports = [
  {
    title: "ogrn",
    allowNull: true,
    message: "Введите ОГРН",
    validate: validation.ogrn,
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
]
