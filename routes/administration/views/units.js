'use strict'

const express                     = require('express');
const errors                      = require(`${__root}/json/errors`);
const constants                   = require(`${__root}/functions/constants`);
const commonUnitsGet              = require(`${__root}/functions/common/units/get`);
const administrationAppStrings    = require(`${__root}/json/strings/administration`);

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

module.exports = router;