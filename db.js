const Sequelize = require('sequelize');
require('dotenv').config();

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.USER, process.env.PASSWORD, {
//   dialect: 'mysql',
//   host: process.env.HOSTNAME,
//   logging: false
// });

const sequelize = new Sequelize('epra_journal', 'admin', 'Epra&DB^!23', {
  dialect: 'mysql',
  host: 'epra-journal.cd6sw8wk8fww.ap-south-1.rds.amazonaws.com',
  logging: false
});


module.exports = sequelize;