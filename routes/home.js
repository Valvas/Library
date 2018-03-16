'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') : 
  
  commonAppsAccess.getAppsAvailableForAccount(req.session.account.id, req.app.get('mysqlConnector'), (error, access) =>
  {
    error != null ?

    res.render('block', { message: errors[error.code] }) :

    res.render('home',
    { 
      account: req.session.account, 
      news: require('../json/news'), 
      strings: { common: commonStrings }, 
      apps: access 
    });
  });
});

/****************************************************************************************************/

module.exports = router;