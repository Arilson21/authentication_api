// Importing necessary modules
const express = require("express");
const port = 4000;
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/erroHandler'); // Importing error handling middleware
const authRoutes = require('./routes/userRoutes'); // Importing user routes
const mongoose = require('mongoose');
const morgan = require('morgan'); // HTTP request logger middleware


// Connecting to MongoDB database
mongoose.connect("mongodb://admin:admin@localhost:27017/admin", {
  auth: { authSource: 'admin' },
  user: 'admin',
  pass: 'admin',
  dbName: 'bancoDeDados',   
})
.then(() => {
  console.log('connected to the database');
  app.emit('ready'); // Emitting 'ready' event when connected to the database
})
.catch(e => console.log(e));


const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api/user', authRoutes);
app.use(notFound);
app.use(errorHandler);

// Event listener for the 'ready' event, starting the server when the database is connected
app.on('ready', () => {
  app.listen(port, () => {
    console.log(`server started on port ${port}`);
  });
});
