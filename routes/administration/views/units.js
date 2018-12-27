'use strict'

const express                     = require('express');
const errors                      = require(`${__root}/json/errors`);
const constants                   = require(`${__root}/functions/constants`);
const commonUnitsGet              = require(`${__root}/functions/common/units/get`);
const administrationAppStrings    = require(`${__root}/json/strings/administration`);
const commonAccountsGet           = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  commonUnitsGet.getUnits(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, units) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

    res.render('administration/units/home',
    {
      account: req.app.locals.account,
      currentLocation: 'units',
      currentConfigTab: 'home',
      strings: { administrationStrings: administrationAppStrings },
      units: units
    });
  });
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  commonUnitsGet.getUnits(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, units) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

    res.render('administration/units/create',
    {
      account: req.app.locals.account,
      currentLocation: 'units',
      currentConfigTab: 'create',
      strings: { administrationStrings: administrationAppStrings },
      units: units
    });
  });
});

/****************************************************************************************************/

router.get('/manage', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  commonUnitsGet.getUnits(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, units) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

    commonAccountsGet.getAllAccounts(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

      var index = 0;

      var browseAccounts = () =>
      {
        commonUnitsGet.getAccountUnit(accounts[index].uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountUnit) =>
        {
          if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/administration' });

          accounts[index].unit = { unitId: accountUnit.id, unitName: accountUnit.name };

          if(accounts[index += 1] != undefined) return browseAccounts();

          res.render('administration/units/manage',
          {
            account: req.app.locals.account,
            currentLocation: 'units',
            currentConfigTab: 'manage',
            strings: { administrationStrings: administrationAppStrings },
            units: units,
            accounts: accounts
          });
        });
      }

      browseAccounts();
    });
  });
});

/****************************************************************************************************/

module.exports = router;