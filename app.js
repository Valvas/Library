'use strict';

global.__root = __dirname;

var path              = require('path');
var mysql             = require('mysql');
var logger            = require('morgan');
var express           = require('express');
var nodemailer        = require('nodemailer');
var bodyParser        = require('body-parser');
var favicon           = require('serve-favicon');
var cookieParser      = require('cookie-parser');
var session           = require('express-session');

var auth              = require('./auth');
var adminAuth         = require('./admin_auth');
var config            = require('./json/config');
var init              = require('./functions/init/start');
var encryption        = require('./functions/encryption');
var accounts          = require('./functions/accounts/init');
var database          = require('./functions/database/init');

var root              = require('./routes/root');
var home              = require('./routes/home');
var file              = require('./routes/file');
var reports           = require('./routes/reports');
var service           = require('./routes/service');

var adminRoot         = require('./routes/admin/root');
var adminUser         = require('./routes/admin/user');
var adminRights       = require('./routes/admin/rights');
var adminParams       = require('./routes/admin/params');
var adminReports      = require('./routes/admin/reports');
var adminService      = require('./routes/admin/service');

var app = express();

app.set('port', config.port);
    
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
    
app.set('transporter', transporter);

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(
{
  secret: 'sdgdsfgd7ugdq87dfsd8glqgOkoh56hhqshoOHU9870jfoqo7y',
  resave: false,
  saveUninitialized: false,
  cookie: {  }
}));

if(config.configured == false)
{
  module.exports = (callback) =>
  {
    init.startInit(app, (errorObject) =>
    {
      if(errorObject != null)
      {
        console.log(errorObject.message);
        process.exit(1);
      }

      else
      {
        callback(app);
      }
    });
  }
}

else
{
  var connection = undefined;

  var transporter = nodemailer.createTransport(
  {
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: 
    {
      user: config.email.auth.user,
      pass: config.email.auth.pass
    },
    tls: 
    {
      rejectUnauthorized: false
    }
  });

  app.use('/', root);
  app.use('/home', home);
  app.use('/file', auth, file);
  app.use('/reports', auth, reports);
  app.use('/service', auth, service);
  app.use('/admin', auth, adminAuth, adminRoot);
  app.use('/admin/users', auth, adminAuth, adminUser);
  app.use('/admin/rights', auth, adminAuth, adminRights);
  app.use('/admin/params', auth, adminAuth, adminParams);
  app.use('/admin/reports', auth, adminAuth, adminReports);
  app.use('/admin/services', auth, adminAuth, adminService);
      
  app.use((req, res, next) =>
  {
    res.render('block', { message: `404 - La page recherchée n'existe pas` });
  });

  module.exports = (callback) =>
  {    
    var databaseCounterRetries = 0;
      
    var databaseConnectionLoop = () =>
    {
      connection = mysql.createConnection(
      {
        host     : config['database']['host'],
        user     : config['database']['user'],
        password : config['database']['password']
      });

      connection.connect((err) =>
      {
        databaseCounterRetries += 1;
      
        if(databaseCounterRetries < 10 && err)
        {
          console.log(err.message);
          setTimeout(() =>{ databaseConnectionLoop(); }, 1000);
        }
      
        else if(databaseCounterRetries == 10) process.exit(1);

        else
        {
          database.createDatabases(connection, () =>
          { 
            accounts.createAccounts(connection, () =>
            {
              accounts.createRights(connection, () =>
              {
                app.set('mysqlConnector', connection);
                callback(app);
              });
            });
          });
        }
      });
    }
      
    databaseConnectionLoop();
  }
}