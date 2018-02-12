'use strict'

const fs                = require('fs');
const mysql             = require('mysql');
const express           = require('express');
const auth              = require(`${__root}/auth`);
const adminAuth         = require(`${__root}/admin_auth`);
const encryption        = require(`${__root}/functions/encryption`);
const accounts          = require(`${__root}/functions/accounts/init`);
const database          = require(`${__root}/functions/database/init`);

const root              = require(`${__root}/routes/root`);
const home              = require(`${__root}/routes/home`);
const file              = require(`${__root}/routes/file`);
const reports           = require(`${__root}/routes/reports`);
const service           = require(`${__root}/routes/service`);

const adminRoot         = require(`${__root}/routes/admin/root`);
const adminUser         = require(`${__root}/routes/admin/user`);
const adminRights       = require(`${__root}/routes/admin/rights`);
const adminParams       = require(`${__root}/routes/admin/params`);
const adminReports      = require(`${__root}/routes/admin/reports`);
const adminService      = require(`${__root}/routes/admin/service`);

/****************************************************************************************************/

module.exports.startInit = (app, callback) =>
{
  var init = require(`${__root}/routes/init`);

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
  const params = require(`${__root}/json/params`);

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

  var pool = mysql.createPool(
  {
    connectionLimit   : 10,
    host              : params.database.host,
    user              : params.database.user,
    port              : params.database.port,
    password          : params.database.password
  });

  database.createDatabases(pool, () =>
  { 
    accounts.createAccounts(pool, () =>
    {
      accounts.createRights(pool, () =>
      {
        app.set('mysqlConnector', pool);
        callback();
      });
    });
  });
}

/****************************************************************************************************/