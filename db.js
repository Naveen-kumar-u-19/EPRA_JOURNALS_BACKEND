const Sequelize = require('sequelize');
require('dotenv').config();
const { getEpraSecrets } = require('./services/web/secretManager.service');

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
// let sequelize;

// (async () => {
//   try {
//     const secret = await getEpraSecrets();

//     sequelize = new Sequelize(secret.DB_NAME, secret.DB_USER, secret.DB_PASSWORD, {
//       host: secret.DB_HOST,
//       dialect: 'mysql',
//       logging: false,
//     });

//     await sequelize.authenticate();
//     console.log('Database connection established using Secrets Manager.');
//   } catch (err) {
//     console.error('Unable to connect to the database:', err);
//     process.exit(1);
//   }
// })();

module.exports = sequelize;