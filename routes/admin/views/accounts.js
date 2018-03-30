'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const adminAppStrings       = require(`${__root}/json/strings/admin`);
const commonAppStrings      = require(`${__root}/json/strings/common`);
const accountsGet           = require(`${__root}/functions/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  accountsGet.getAllAccounts(req.app.get('mysqlConnector'), (error, accounts) =>
  {
    if(error != null)
    {
      res.render('admin/accounts/home',
      { 
        account: req.session.account,
        error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
        strings: { common: commonAppStrings, admin: adminAppStrings },
        accounts: null
      });
    }

    else
    {
      res.render('admin/accounts/home',
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
  accountsGet.getAccountUsingUUID(req.params.account, req.app.get('mysqlConnector'), (error, account) =>
  {
    if(error != null)
    {
      res.render('admin/accounts/detail',
      { 
        account: req.session.account,
        error: { message: errors[error.code], detail: error.detail == undefined ? null : error.detail },
        strings: { common: commonAppStrings, admin: adminAppStrings },
        result: null,
        rights: null
      });
    }

    else
    {
      res.render('admin/accounts/detail',
      { 
        account: req.session.account,
        error: null,
        strings: { common: commonAppStrings, admin: adminAppStrings },
        result: account,
        rights: req.app.locals.rights
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;