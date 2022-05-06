const { Client } = require("../sequelize.js");
module.exports = async function (userData) {
  const client = await Client.create({ ...userData, verified: false });
  return client;
};
