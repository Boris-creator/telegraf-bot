const { Client } = require("../sequelize.js");
module.exports = async function (userData) {
  const client = await Client.findOne({where: userData})
  return client;
};