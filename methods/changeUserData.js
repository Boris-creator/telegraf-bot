const { Client } = require("../sequelize.js");
const argon2 = require("argon2");
const rgxps = require("../validation");
function validate(data) {
  const dictionary = {
    телефон: "phone_personal",
    почта: "mail_personal",
    фио: "fio",
    пароль: "password",
  };
  const res = {};
  for (let key in data) {
    if (key in dictionary) {
      res[dictionary[key]] = data[key];
      console.log(key);
      if (!rgxps[dictionary[key]].test(data[key])) {
        return false;
      }
    }
  }
  if (!Object.keys(res).length) {
    return false;
  }
  return res;
}
module.exports = async function (newData, id) {
  newData = validate(newData);
  if (!newData) {
    return false;
  }
  if ("password" in newData) {
    newData.password = await argon2.hash(newData.password);
  }
  console.log(newData)
  const user = await Client.update(newData, { where: { id } });
  return user;
};
