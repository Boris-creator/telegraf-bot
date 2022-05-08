const { Client } = require("../sequelize.js");
module.exports = async function (data) {
  return await Client.destroy({ where: data });
};
