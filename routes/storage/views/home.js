'use strict'

const express               = require('express');
const commonAppStrings      = require(`${__root}/json/strings/common`);
const storageAppStrings     = require(`${__root}/json/strings/storage`);
const webContent            = require(`${__root}/json/share/webcontent`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('storage/home',
  { 
    account: req.app.locals.account, 
    strings: { common: commonAppStrings, storage: storageAppStrings },
    webContent: webContent,
    location: 'home'
  });
});

/****************************************************************************************************/

module.exports = router;