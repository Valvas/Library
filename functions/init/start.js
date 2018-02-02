'use strict'

const fs                = require('fs');
const express           = require('express');
const encryption        = require(`${__root}/functions/encryption`);

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
            app.use((req, res, next) => { res.redirect('/init/logon'); });

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
}

/****************************************************************************************************/