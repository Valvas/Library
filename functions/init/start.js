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
const initCreateAccounts  = require(`${__root}/functions/init/createAccounts`);

/****************************************************************************************************/

module.exports.startInit = (app, callback) =>
{
  const init = require(`${__root}/routes/init`);

  encryption.getInitPassword((password) =>
  {
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

  const adminViewsHome            = require(`${__root}/routes/admin/views/home`);
  const adminViewsAccounts        = require(`${__root}/routes/admin/views/accounts`);

  const adminQueriesAccounts      = require(`${__root}/routes/admin/queries/accounts`);

  const storageViewsHome          = require(`${__root}/routes/storage/views/home`);
  const storageViewsAdmin         = require(`${__root}/routes/storage/views/admin`);
  const storageViewsServices      = require(`${__root}/routes/storage/views/services`);

  const storageQueriesAdmin       = require(`${__root}/routes/storage/queries/admin`);
  const storageQueriesStrings     = require(`${__root}/routes/storage/queries/strings`);
  const storageQueriesServices    = require(`${__root}/routes/storage/queries/services`);

  const params            = require(`${__root}/json/params`);

  app.set('params', params);

  app.use('/', root);
  app.use('/home', homeViews);

  app.use('/admin', auth, adminAppAuth, adminViewsHome);
  app.use('/admin/accounts', auth, adminAppAuth, adminViewsAccounts);

  app.use('/queries/admin/accounts', auth, adminAppAuth, adminQueriesAccounts);

  app.use('/storage', auth, storageViewsHome);
  app.use('/storage/admin', storageAppAdminAuth, storageViewsAdmin);
  app.use('/storage/services', auth, storageViewsServices);

  app.use('/queries/storage/admin', storageAppAdminAuth, storageQueriesAdmin);
  app.use('/queries/storage/strings', auth, storageQueriesStrings);
  app.use('/queries/storage/services', auth, storageQueriesServices);

  app.use((req, res, next) =>
  {
    res.render('block', { message: `404 - La page recherchée n'existe pas` });
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
    
      database.createDatabases(pool, () =>
      { 
        initCreateAccounts.createAccounts(pool, () =>
        {
          initCreateRights.createRights(pool, () =>
          {
            /*services.createServices(pool, (error) =>
            {
              if(error != null)
              {
                console.log(`[ERROR] - ${error.detail} !`);
                process.exit(1);
              }
    
              else
              {*/
                app.set('mysqlConnector', pool);
    
                initFolder.createAppFolders(params, (error) =>
                {
                  error == null ? callback() : process.exit(0);
                });
              /*}
            });*/
          });
        });
      });
    }
  });
}

/****************************************************************************************************/