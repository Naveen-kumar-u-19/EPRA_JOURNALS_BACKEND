const express = require('express'); // express package
const app = new express();
const cors = require('cors'); //cors package
const { sequelize } = require('./models');
const AdminRoute = require('./routes/api');

require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use('/v1', AdminRoute)
app.use((req, res) => {
  res.send('Invalid route');
})


sequelize.sync({ force: false }).then(() => {
  console.log('Connected to DB....');
}).catch((err) => {
  console.log('Failed to connect DB...', err);
})

app.listen(process.env.PORT);