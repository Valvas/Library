'use strict'

const fs                  = require('fs');
const mysql               = require('mysql');
const nodemailer          = require('nodemailer');
const auth                = require(`${__root}/auth`);
const units               = require(`${__root}/json/units`);
const initAuthentication  = require(`${__root}/initAuthentication`);
const appsInit            = require(`${__root}/functions/init/apps`);
const unitsInit           = require(`${__root}/functions/init/units`);
const encryption          = require(`${__root}/functions/encryption`);
const initFolder          = require(`${__root}/functions/init/folders`);
const database            = require(`${__root}/functions/database/init`);
const accountsInit        = require(`${__root}/functions/init/accounts`);

const stringsQueries      = require(`${__root}/routes/strings`);

const storageAppAccess        = require(`${__root}/functions/storage/checkAccess`);
const storageAppAdminAccess   = require(`${__root}/functions/storage/checkAdminAccess`);

/****************************************************************************************************/

module.exports.startInit = (app, callback) =>
{
  const init = require(`${__root}/routes/init`);

  encryption.getInitPassword((error, password) =>
  {
    fs.open(`${__root}/password`, 'w', (error, fd) =>
    {
      if(error) return callback({ message: error.message });

      fs.write(fd, password, (error) =>
      {
        if(error) return callback({ message: err.message });

        app.use('/init', initAuthentication, init);
        app.use('/queries/strings', stringsQueries);

        app.use((req, res, next) =>
        {
          app.get('params').ready == false ? res.redirect('/init/logon') : next();
        });

        return callback();
      });
    });
  });
}

/****************************************************************************************************/

module.exports.startApp = (app, callback) =>
{
  const root                          = require(`${__root}/routes/root`);
  const homeViews                     = require(`${__root}/routes/root/views/home`);
  const appsViews                     = require(`${__root}/routes/root/views/apps`);
  const newsViews                     = require(`${__root}/routes/root/views/news`);
  const accountViews                  = require(`${__root}/routes/root/views/account`);
  const directoryViews                = require(`${__root}/routes/root/views/directory`);

  const rootQueriesNews               = require(`${__root}/routes/root/queries/news`);
  const rootQueriesApps               = require(`${__root}/routes/root/queries/apps`);
  const rootQueriesAccount            = require(`${__root}/routes/root/queries/account`);
  const rootQueriesDirectory          = require(`${__root}/routes/root/queries/directory`);

  const administrationViewsHome       = require(`${__root}/routes/administration/views/home`);
  const administrationViewsUnits      = require(`${__root}/routes/administration/views/units`);
  const administrationViewsAccess     = require(`${__root}/routes/administration/views/access`);
  const administrationViewsAccounts   = require(`${__root}/routes/administration/views/accounts`);
  const administrationViewsConfig     = require(`${__root}/routes/administration/views/configuration`);

  const administrationQueriesUnits    = require(`${__root}/routes/administration/queries/units`);
  const administrationQueriesAccess   = require(`${__root}/routes/administration/queries/access`);
  const administrationQueriesAccounts = require(`${__root}/routes/administration/queries/accounts`);

  const storageViewsHome              = require(`${__root}/routes/storage/views/home`);
  const storageViewsAdmin             = require(`${__root}/routes/storage/views/admin`);
  const storageViewsServices          = require(`${__root}/routes/storage/views/services`);

  const storageQueriesAdmin           = require(`${__root}/routes/storage/queries/admin`);
  const storageQueriesStrings         = require(`${__root}/routes/storage/queries/strings`);
  const storageQueriesServices        = require(`${__root}/routes/storage/queries/services`);

  const apiMessenger                  = require(`${__root}/routes/messenger`);

  const params = app.get('params');

  app.use('/api/messenger', auth, apiMessenger);

  app.use('/', root);
  app.use('/home', auth, homeViews);
  app.use('/apps', auth, appsViews);
  app.use('/news', auth, newsViews);
  app.use('/account', auth, accountViews);
  app.use('/directory', auth, directoryViews);

  app.use('/queries/strings', auth, stringsQueries);

  app.use('/queries/root/news', auth, rootQueriesNews);
  app.use('/queries/root/apps', auth, rootQueriesApps);
  app.use('/queries/root/account', auth, rootQueriesAccount);
  app.use('/queries/root/directory', auth, rootQueriesDirectory);

  app.use('/administration', auth, administrationViewsHome);
  app.use('/administration/units', auth, administrationViewsUnits);
  app.use('/administration/access', auth, administrationViewsAccess);
  app.use('/administration/accounts', auth, administrationViewsAccounts);
  app.use('/administration/configuration', auth, administrationViewsConfig);

  app.use('/queries/administration/units', auth, administrationQueriesUnits);
  app.use('/queries/administration/access', auth, administrationQueriesAccess);
  app.use('/queries/administration/accounts', auth, administrationQueriesAccounts);

  app.use('/storage', auth, storageAppAccess, storageViewsHome);
  app.use('/storage/admin', auth, storageAppAccess, storageAppAdminAccess, storageViewsAdmin);
  app.use('/storage/service', auth, storageAppAccess, storageAppAdminAccess, storageViewsServices);

  app.use('/queries/storage/admin', auth, storageAppAccess, storageAppAdminAccess, storageQueriesAdmin);
  app.use('/queries/storage/strings', auth, storageAppAccess, storageQueriesStrings);
  app.use('/queries/storage/services', auth, storageAppAccess, storageQueriesServices);

  app.use((req, res, next) =>
  {
    res.render('block', { message: `La page recherchée n'existe pas`, detail: null, link: req.headers.referer == undefined ? '/' : req.headers.referer.slice(req.headers.referer.length - req.url.length) === req.url ? '/' : req.headers.referer });
  });

  const pool = mysql.createPool(
  {
    connectionLimit   : 10,
    host              : params.database.host,
    user              : params.database.user,
    port              : params.database.port,
    password          : params.database.password
  });

  const transporter = nodemailer.createTransport(
  {
    host                  : params.transporter.address,
    port                  : params.transporter.port,
    secure                : params.transporter.secure,
    auth:
    {
      user                : params.transporter.user,
      pass                : params.transporter.password
    },
    tls:
    {
      rejectUnauthorized  : false
    }
  });

  app.set('transporter', transporter);
  app.set('databaseConnectionPool', pool);

  database.createDatabases(pool, () =>
  {
    initFolder.createAppFolders(params, (error) =>
    {
      accountsInit.createAdminAccounts(pool, app.get('params'), transporter, (error) =>
      {
        if(error != null)
        {
          console.log(error);

          process.exit(1);
        }

        unitsInit.createUnits(units, pool, app.get('params'), (error) =>
        {
          if(error != null)
          {
            console.log(error);

            process.exit(1);
          }

          appsInit.createApps(pool, app.get('params'), (error) =>
          {
            if(error == null) return callback();

            console.log(error);

            process.exit(1);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/
