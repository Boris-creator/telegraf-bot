const Sequelize = require("sequelize");
module.exports = {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  ogrn: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  inn: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  mail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phone_personal: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  mail_personal: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  fio: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  verified: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  }
};
