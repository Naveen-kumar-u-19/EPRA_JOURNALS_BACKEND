const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.USER, process.env.PASSWORD, {
  dialect: 'postgres',
  host: process.env.HOSTNAME,
  logging: false
})
module.exports = sequelize;