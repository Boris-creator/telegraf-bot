const { Client, Collaborator } = require("../sequelize.js");
const argon2 = require("argon2");
const rgxps = require("../assets/validation")
async function validate(data) {
  if (data.inn == null && data.ogrn == null) {
    return false;
  }
  if (data.phone == null && data.mail == null) {
    return false;
  }
  if (data.phone_personal == null && data.mail_personal == null) {
    return false;
  }
  if (data.fio == null || data.password == null) {
    return false;
  }
  for (let key in data) {
    if (data[key] && !rgxps[key].test(data[key])) {
      //return false;
    }
  }
  const { mail, phone } = data;
  const user = await Client.findOne({ where: { mail } });
  console.log(mail, user);
  if (mail && user) {
    return false;
  }
  const admin = await Collaborator.findOne({ where: { mail } });
  if (mail && admin) {
    return false;
  }
  const user2 = await Client.findOne({ where: { phone } });
  if (phone && user2) {
    return false;
  }
  const admin2 = await Collaborator.findOne({ where: { phone } });
  if (phone && admin2) {
    return false;
  }
  return true;
}
module.exports = async function (userData) {
  if (!(await validate(userData))) {
    return null;
  }
  const passwordHashed = await argon2.hash(userData.password);
  userData.password = passwordHashed;
  const client = await Client.create({ ...userData, verified: false });
  return client;
};
