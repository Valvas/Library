'use strict';

let path              = require('path');
let mysql             = require('mysql');
let logger            = require('morgan');
let express           = require('express');
let bodyParser        = require('body-parser');
let favicon           = require('serve-favicon');
let cookieParser      = require('cookie-parser');
let session           = require('express-session');

let auth              = require('./auth');
let config            = require('./json/config');
let accounts          = require('./functions/accounts/init');
let database          = require('./functions/database/init');

let root              = require('./routes/root');
let home              = require('./routes/home');
let menu              = require('./routes/menu');
let service           = require('./routes/service');

let connection = mysql.createConnection(
{
  host     : config['database']['host'],
  user     : config['database']['user'],
  password : config['database']['password']
});

let app = express();

app.use(session(
{
  secret: 'sdgdsfgd7ugdq87dfsd8glqgOkoh56hhqshoOHU9870jfoqo7y',
  resave: false,
  saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('mysqlConnector', connection);

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', root);
app.use('/home', home);
app.use('/menu', menu);
app.use('/service', auth, service);

app.use(function(req, res, next) 
{
  res.redirect('/');
});

database.createDatabases(connection, function(result, message)
{ 
  console.log(message);

  accounts.createAccounts(connection, function(message)
  {
    console.log(message);
  });
});

module.exports = app;
