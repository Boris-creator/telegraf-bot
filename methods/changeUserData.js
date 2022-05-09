const { Client } = require("../sequelize.js");
const argon2 = require("argon2");
const rgxps = require("../assets/validation");
function validate(data) {
  if (!Object.keys(data).length) {
    return false;
  }
  for (let key in data) {
    if (rgxps[key] && !rgxps[key].test(data[key])) {
      return false;
    }
  }
  return true;
}
module.exports = async function (newData, id) {
  if (!validate(newData)) {
    return false;
  }
  if ("password" in newData) {
    newData.password = await argon2.hash(newData.password);
  }
  const user = await Client.update(newData, { where: { id } });
  return user;
};
