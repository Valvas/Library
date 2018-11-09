'use strict'

const express                     = require('express');
const administrationAppStrings    = require(`${__root}/json/strings/administration`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('administration/accounts/home',
  {
    account: req.app.locals.account,
    currentLocation: 'accounts',
    strings: { administrationStrings: administrationAppStrings }
  });
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  res.render('administration/accounts/create',
  {
    account: req.app.locals.account,
    currentLocation: 'accounts',
    strings: { administrationStrings: administrationAppStrings }
  });
});

/****************************************************************************************************/

module.exports = router;