'use strict'

const express               = require('express');
const apps                  = require(`${__root}/json/apps`);
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const webContent            = require(`${__root}/json/share/webcontent`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') : 
  
  commonAppsAccess.getAppsAvailableForAccount(req.session.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, access) =>
  {
    error != null ?

    res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

    res.render('apps',
    { 
      account: req.session.account, 
      navigationBarLocation: 'apps',
      locations: [ 'apps' ],
      webContent: webContent,
      strings: { common: commonStrings }, 
      access: access,
      apps: apps
    });
  });
});

/****************************************************************************************************/

module.exports = router;