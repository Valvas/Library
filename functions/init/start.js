'use strict'

const fs                  = require('fs');
const mysql               = require('mysql');
const express             = require('express');
const nodemailer          = require('nodemailer');
const auth                = require(`${__root}/auth`);
const encryption          = require(`${__root}/functions/encryption`);
const adminAppAuth        = require(`${__root}/functions/admin/auth`);
const storageAppAdminAuth = require(`${__root}/functions/storage/auth`);
const initFolder          = require(`${__root}/functions/init/folders`);
const database            = require(`${__root}/functions/database/init`);
const services            = require(`${__root}/functions/services/init`);
const initCreateRights    = require(`${__root}/functions/init/createRights`);
const shareAppInit        = require(`${__root}/functions/init/shareAppInit`);
const initCreateAccounts  = require(`${__root}/functions/init/createAccounts`);

/****************************************************************************************************/

module.exports.startInit = (app, callback) =>
{
  const init = require(`${__root}/routes/init`);

  encryption.getInitPassword((error, password) =>
  {
    if(error != null) process.exit(1);
    
    fs.open(`${__root}/password`, 'w', (err, fd) =>
    {
      if(err) callback({ message: err.message });

      else
      {
        fs.write(fd, password, (err) =>
        {
          if(err) callback({ message: err.message });

          else
          {
            app.use('/init', init);
            app.use((req, res, next) =>
            {
              app.get('params').ready == false ? res.redirect('/init/logon') : next();
            });

            callback();
          }
        });
      }
    });
  });
}

/****************************************************************************************************/

module.exports.startApp = (app, callback) =>
{
  const root                      = require(`${__root}/routes/root`);
  const homeViews                 = require(`${__root}/routes/root/views/home`);
  const appsViews                 = require(`${__root}/routes/root/views/apps`);

  const accountsQueries           = require(`${__root}/routes/accounts`);

  const adminViewsHome            = require(`${__root}/routes/admin/views/home`);
  const adminViewsRights          = require(`${__root}/routes/admin/views/rights`);
  const adminViewsAccess          = require(`${__root}/routes/admin/views/access`);
  const adminViewsAccounts        = require(`${__root}/routes/admin/views/accounts`);

  const adminQueriesRights        = require(`${__root}/routes/admin/queries/rights`);
  const adminQueriesAccess        = require(`${__root}/routes/admin/queries/access`);
  const adminQueriesStrings       = require(`${__root}/routes/admin/queries/strings`);
  const adminQueriesAccounts      = require(`${__root}/routes/admin/queries/accounts`);

  const diseaseViewsRoot          = require(`${__root}/routes/disease/views/root`);

  const storageViewsHome          = require(`${__root}/routes/storage/views/home`);
  const storageViewsAdmin         = require(`${__root}/routes/storage/views/admin`);
  const storageViewsServices      = require(`${__root}/routes/storage/views/services`);

  const storageQueriesAdmin       = require(`${__root}/routes/storage/queries/admin`);
  const storageQueriesStrings     = require(`${__root}/routes/storage/queries/strings`);
  const storageQueriesServices    = require(`${__root}/routes/storage/queries/services`);

  const params = app.get('params');

  app.use('/', root);
  app.use('/home', homeViews);
  app.use('/apps', appsViews);

  app.use('/queries/accounts', auth, accountsQueries);

  app.use('/admin', auth, adminAppAuth, adminViewsHome);
  app.use('/admin/rights', auth, adminAppAuth, adminViewsRights);
  app.use('/admin/access', auth, adminAppAuth, adminViewsAccess);
  app.use('/admin/accounts', auth, adminAppAuth, adminViewsAccounts);

  app.use('/queries/admin/rights', auth, adminAppAuth, adminQueriesRights);
  app.use('/queries/admin/access', auth, adminAppAuth, adminQueriesAccess);
  app.use('/queries/admin/strings', auth, adminAppAuth, adminQueriesStrings);
  app.use('/queries/admin/accounts', auth, adminAppAuth, adminQueriesAccounts);

  app.use('/storage', auth, storageViewsHome);
  app.use('/storage/admin', storageAppAdminAuth, storageViewsAdmin);
  app.use('/storage/services', auth, storageViewsServices);

  app.use('/queries/storage/admin', storageAppAdminAuth, storageQueriesAdmin);
  app.use('/queries/storage/strings', auth, storageQueriesStrings);
  app.use('/queries/storage/services', auth, storageQueriesServices);

  app.use('/disease', auth, diseaseViewsRoot);

  app.use((req, res, next) =>
  {
    res.render('block', { message: `La page recherchée n'existe pas`, link: '/' });
  });

  fs.readFile(`${__root}/json/services.json`, (error, data) =>
  {
    if(error) process.exit(0);

    else
    {
      var json = JSON.parse(data);

      app.set('servicesExtensionsAuthorized', json);

      var pool = mysql.createPool(
      {
        connectionLimit   : 10,
        host              : params.database.host,
        user              : params.database.user,
        port              : params.database.port,
        password          : params.database.password
      });

      var connection = mysql.createConnection(
      {
        host              : params.database.host,
        user              : params.database.user,
        port              : params.database.port,
        password          : params.database.password
      });
    
      var transporter = nodemailer.createTransport(
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
      app.set('mysqlConnector', connection);
      app.set('databaseConnectionPool', pool);

      shareAppInit.initShareApplication(params.database.storage, pool);
    
      database.createDatabases(pool, () =>
      { 
        initCreateAccounts.createAccounts(pool, transporter, () =>
        {
          initCreateRights.createRights(pool, () =>
          {
            initFolder.createAppFolders(params, (error) =>
            {
              if(error == null) callback();
              
              else
              {
                console.log(error);
                
                process.exit(0);
              }
            });
          });
        });
      });
    }
  });
}

/****************************************************************************************************/