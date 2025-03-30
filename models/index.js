const fs = require('fs');
const path = require('path');
const sequelize = require('../db');


const models = {};

fs.readdirSync(__dirname)
  .filter((file) => file !== 'index.js' && file.endsWith('.js'))
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    models[model.name] = model;
  });


Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

console.log('models', models);


module.exports = { sequelize, ...models };