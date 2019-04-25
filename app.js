'use strict'

global.__root = __dirname;

const fs                = require('fs');
const path              = require('path');
const morgan            = require('morgan');
const express           = require('express');
const bodyParser        = require('body-parser');
const favicon           = require('serve-favicon');
const cookieParser      = require('cookie-parser');

const initLauncher      = require(`${__root}/functions/init/start`);

const app = express();

module.exports = (callback) =>
{
  process.env.NODE_ENV = 'production';

  fs.readFile('./json/params.json', (error, data) =>
  {
    if(error !== null)
    {
      console.error(new Error('Could not read config file'));
      process.exit(1);
    }

    const params = JSON.parse(data);

    if(params === null)
    {
      console.error(new Error('Could not parse config data to JSON'));
      process.exit(1);
    }

    app.set('params', params);

    app.set('view engine', 'ejs');
    app.set('views', `${__root}/views`);

    params.init.defaultPort < 0 || params.init.defaultPort > 65535
    ? app.set('port', 3000)
    : app.set('port', params.init.defaultPort);

    app.use(morgan('dev'));
    app.use(cookieParser());
    app.use(express.static(`${__root}/public`));
    app.use(bodyParser.json({ limit: 5242880 }));
    app.use(bodyParser.urlencoded({ extended: false, limit: 5242880 }));

    app.use(favicon(path.join(__dirname, 'public', 'pictures', 'logo.ico')));

    if(params.ready === false)
    {
      initLauncher.startInit(app, (error) =>
      {
        if(error !== null)
        {
          console.error(new Error(error.message));
          process.exit(1);
        }

        return callback(app);
      });
    }

    else
    {
      initLauncher.startApp(app, (error) =>
      {
        if(error !== null)
        {
          console.error(new Error(error.message));
          process.exit(1);
        }

        return callback(app);
      });
    }
  });
}
