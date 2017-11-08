'use strict';

let path              = require('path');
let logger            = require('morgan');
let express           = require('express');
let bodyParser        = require('body-parser');
let favicon           = require('serve-favicon');
let cookieParser      = require('cookie-parser');

let root              = require('./routes/root');

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', root);

app.use(function(req, res, next) 
{
  res.redirect('/');
});

module.exports = app;
