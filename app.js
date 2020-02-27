require("dotenv").config();
require("./config/dbConnection");
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");

var app = express();

var corsOptions = {
    origin: process.env.FRONTEND_URI
  }

  app.use(cors(corsOptions))

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var buildingRouter = require('./routes/buildings');


app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/buildings', buildingRouter);

module.exports = app;
