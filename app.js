'use strict'

global.__root = __dirname;

const fs                = require('fs');
const path              = require('path');
const morgan            = require('morgan');
const express           = require('express');
const bodyParser        = require('body-parser');
const favicon           = require('serve-favicon');
const cookieParser      = require('cookie-parser');
const session           = require('express-session');

var app = express();

module.exports = (callback) =>
{
  fs.readFile('./json/params.json', (err, data) =>
  {
    if(err)
    {
      console.log('[ERROR] - could not read config file !');
      process.exit(0);
    }
  
    else
    {
      var params = JSON.parse(data);
      
      app.set('params', params);
      
      app.set('view engine', 'ejs');
      app.set('views', `${__root}/views`);
      app.set('port', params.init.defaultPort);
      
      app.use(morgan('dev'));
      app.use(cookieParser());
      app.use(bodyParser.json());
      app.use(express.static(`${__root}/public`));
      app.use(bodyParser.urlencoded({ extended: false }));

      app.use(favicon(path.join(__dirname,'public', 'pictures', 'logo.ico')));
      
      app.use(session(
      {
        secret: 'sdgdsfgd7ugdq87dfsd8glqgOkoh56hhqshoOHU9870jfoqo7y',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 86400000 }
      }));
      
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
  });
}