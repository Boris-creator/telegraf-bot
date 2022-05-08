const { Client } = require("../sequelize.js");
module.exports = async function (params, multipleMode = true) {
  return multipleMode
    ? await Client.findAll({ where: params })
    : await Client.findOne({ where: params });
};
