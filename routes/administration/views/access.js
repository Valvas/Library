'use strict'

const express                     = require('express');
const errors                      = require(`${__root}/json/errors`);
const constants                   = require(`${__root}/functions/constants`);
const commonStrings               = require(`${__root}/json/strings/common`);
const administrationAppStrings    = require(`${__root}/json/strings/administration`);
const commonAccessGet             = require(`${__root}/functions/common/access/get`);
const commonAccountsGet           = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  commonAccountsGet.getAllAccounts(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

    res.render('administration/access/home',
    {
      account: req.app.locals.account,
      currentLocation: 'access',
      strings: { administrationStrings: administrationAppStrings },
      accounts: accounts
    });
  });
});

/****************************************************************************************************/

router.get('/:accountUuid', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  commonAccountsGet.checkIfAccountExistsFromUuid(req.params.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

    if(accountExists == false) return res.render('block', { message: errors[constants.ACCOUNT_NOT_FOUND], detail: null, link: '/administration/access' });

    commonAccessGet.getAccountAccessForAllApps(req.params.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountAccess) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

      res.render('administration/access/detail',
      {
        account: req.app.locals.account,
        currentLocation: 'access',
        strings: { administrationStrings: administrationAppStrings, commonStrings: commonStrings },
        accountToUpdate: accountData,
        accountAccess: accountAccess
      });
    });
  });
});

/****************************************************************************************************/

module.exports = router;