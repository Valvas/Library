'use strict'

const express                     = require('express');
const errors                      = require(`${__root}/json/errors`);
const constants                   = require(`${__root}/functions/constants`);
const administrationAppStrings    = require(`${__root}/json/strings/administration`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  if(req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.USER_IS_NOT_ADMIN], detail: null, link: '/' });

  res.render('administration/home',
  {
    account: req.app.locals.account,
    currentLocation: 'home',
    strings: { administrationStrings: administrationAppStrings }
  });
});

/****************************************************************************************************/

module.exports = router;