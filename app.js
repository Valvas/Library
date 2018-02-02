'use strict'

global.__root = __dirname;

const morgan            = require('morgan');
const express           = require('express');
const bodyParser        = require('body-parser');
const favicon           = require('serve-favicon');
const cookieParser      = require('cookie-parser');
const params            = require('./json/params');
const session           = require('express-session');

var app = express();

app.set('view engine', 'ejs');
app.set('views', `${__root}/views`);
app.set('port', params.init.defaultPort);

app.use(morgan('dev')); //tiny | common | dev
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(`${__root}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session(
{
  secret: 'sdgdsfgd7ugdq87dfsd8glqgOkoh56hhqshoOHU9870jfoqo7y',
  resave: false,
  saveUninitialized: false,
  cookie: {  }
}));

module.exports = (callback) =>
{
  const initLauncher = require(`${__root}/functions/init/start`);

  if(params.ready == false)
  {
    initLauncher.startInit(app, (errorObjectOrNull) =>
    {
      if(errorObjectOrNull == null) callback(app);

      else
      {
        console.log(`[ERROR] - ${errorObjectOrNull.message}`);
        process.exit(1);
      }
    });
  }

  else
  {
    initLauncher.startApp(app, (errorObjectOrNull) =>
    {
      if(errorObjectOrNull == null) callback(app);

      else
      {
        console.log(`[ERROR] - ${errorObjectOrNull.message}`);
        process.exit(1);
      }
    });
  }
}


  /*var transporter = nodemailer.createTransport(
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
  });*/
   

          /*database.createDatabases(connection, () =>
          { 
            accounts.createAccounts(connection, () =>
            {
              accounts.createRights(connection, () =>
              {
                app.set('mysqlConnector', connection);
              });
            });
          });*/