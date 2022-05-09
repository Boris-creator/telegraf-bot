function parse(text) {
  const data = text
    .split(",")
    .map((part) => part.split(":").map((_) => _.trim().toLowerCase()));
  const obj = Object.fromEntries(data);
  const dictionary = {
    телефон: "phone_personal",
    почта: "mail_personal",
    фио: "fio",
    пароль: "password",
  };
  const res = {};
  for (let key in obj) {
    if (key in dictionary) {
      res[dictionary[key]] = obj[key];
    }
  }
  console.log(data, res)
  return res
}
module.exports = { parse };
