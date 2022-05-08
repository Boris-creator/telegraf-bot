const { Collaborator } = require("../sequelize.js");
const argon2 = require("argon2");
const raw_data = require("../collaborators_example.json");
async function prepare(raw_data) {
  const data = [];

  for (let el of raw_data) {
    const password = argon2.hash(el.password);
    data.push({ ...el, password });
  }
  return data;
}

module.exports = async function () {
  const collaborator = await Collaborator.findOne({ where: {} });
  if (!collaborator) {
    const data = prepare(raw_data);
    await Collaborator.bulkCreate(data);
  }
  return true;
};
