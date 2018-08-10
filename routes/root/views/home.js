'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const webContent            = require(`${__root}/json/share/webcontent`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') : 

  res.render('home',
  { 
    account: req.session.account, 
    navigationBarLocation: 'home',
    locations: [ 'home' ],
    webContent: webContent,
    strings: { common: commonStrings }
  });
});

/****************************************************************************************************/

module.exports = router;