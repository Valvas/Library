'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const adminAppStrings       = require(`${__root}/json/strings/admin`);
const commonAppStrings      = require(`${__root}/json/strings/common`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  accountsGet.getAllAccounts(req.app.get('mysqlConnector'), (error, accounts) =>
  {
    if(error != null)
    {
      res.render('admin/access/home',
      { 
        account: req.session.account,
        error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
        strings: { common: commonAppStrings, admin: adminAppStrings },
        accounts: null
      });
    }

    else
    {
      res.render('admin/access/home',
      { 
        account: req.session.account,
        error: null,
        strings: { common: commonAppStrings, admin: adminAppStrings },
        accounts: accounts
      });
    }
  });
});

/****************************************************************************************************/

router.get('/:account', (req, res) =>
{

});

/****************************************************************************************************/

module.exports = router;