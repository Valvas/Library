'use strict';

global.__root = __dirname;

let path              = require('path');
let mysql             = require('mysql');
let logger            = require('morgan');
let express           = require('express');
let bodyParser        = require('body-parser');
let favicon           = require('serve-favicon');
let cookieParser      = require('cookie-parser');
let session           = require('express-session');

let auth              = require('./auth');
let adminAuth         = require('./admin_auth');
let config            = require('./json/config');
let accounts          = require('./functions/accounts/init');
let database          = require('./functions/database/init');

let root              = require('./routes/root');
let home              = require('./routes/home');
let file              = require('./routes/file');
let reports           = require('./routes/reports');
let service           = require('./routes/service');

let adminRoot         = require('./routes/admin/root');
let adminUser         = require('./routes/admin/user');
let adminParams       = require('./routes/admin/params');
let adminService      = require('./routes/admin/service');

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
  saveUninitialized: false,
  cookie: {  }
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
app.use('/file', auth, file);
app.use('/reports', auth, reports);
app.use('/service', auth, service);
app.use('/admin', auth, adminAuth, adminRoot);
app.use('/admin/users', auth, adminAuth, adminUser);
app.use('/admin/params', auth, adminAuth, adminParams);
app.use('/admin/services', auth, adminAuth, adminService);

app.use(function(req, res, next) 
{
  res.render('block', { message: `404 - La page recherchée n'existe pas` });
});

database.createDatabases(connection, () =>
{ 
  accounts.createAccounts(connection, () =>
  {
    accounts.createRights(connection, () =>
    {

    });
  });
});

module.exports = app;
