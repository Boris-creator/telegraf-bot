const { Client } = require("../sequelize.js");
module.exports = async function (userId) {
  const client = await Client.update(
    { verified: true },
    { where: { id: userId } }
  );
  return client;
};
