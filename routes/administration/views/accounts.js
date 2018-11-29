'use strict'

const express                     = require('express');
const errors                      = require(`${__root}/json/errors`);
const constants                   = require(`${__root}/functions/constants`);
const administrationAppStrings    = require(`${__root}/json/strings/administration`);
const commonAccountsGet           = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  commonAccountsGet.getAllAccounts(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

    res.render('administration/accounts/home',
    {
      account: req.app.locals.account,
      currentLocation: 'accounts',
      strings: { administrationStrings: administrationAppStrings },
      accounts: accounts
    });
  })
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  res.render('administration/accounts/create',
  {
    account: req.app.locals.account,
    currentLocation: 'accounts',
    strings: { administrationStrings: administrationAppStrings }
  });
});

/****************************************************************************************************/

module.exports = router;