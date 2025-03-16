const express = require('express'); // express package
const app = new express();
const cors = require('cors'); //cors package
const { sequelize } = require('./models');
const AdminRoute = require('./routes/api');
const WebRoute = require('./routes/web');
const passport = require('passport');
require('dotenv').config();

app.use(cors());
app.use(passport.initialize());
require('./middleware/passport');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// To render EJS files from view folder
app.set('view engine', 'ejs');
app.set('views', './views');



app.use('/v1', AdminRoute); //Admin side api's




app.use('/', WebRoute);
app.use((req, res) => {
  res.send('Invalid route');
})


sequelize.sync({ force: false }).then(() => {
  console.log('Connected to DB....');
}).catch((err) => {
  console.log('Failed to connect DB...', err);
})

app.listen(process.env.PORT);