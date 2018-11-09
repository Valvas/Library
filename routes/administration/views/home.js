'use strict'

const express                     = require('express');
const administrationAppStrings    = require(`${__root}/json/strings/administration`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('administration/home',
  {
    account: req.app.locals.account,
    currentLocation: 'home',
    strings: { administrationStrings: administrationAppStrings }
  });
});

/****************************************************************************************************/

module.exports = router;