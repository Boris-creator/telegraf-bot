require("dotenv").config();
const Sequelize = require("sequelize");
const collaborator = require("./models/collaborator"),
  client = require("./models/client");
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: "localhost",
    define: {
      timestamps: false,
    },
  }
);
const Collaborator = sequelize.define("collaborator", collaborator);
const Client = sequelize.define("client", client);
module.exports = {
  sequelize,
  Collaborator,
  Client,
};
