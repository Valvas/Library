'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonAppStrings      = require(`${__root}/json/strings/common`);
const storageAppStrings     = require(`${__root}/json/strings/storage`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('storage/home',
  { 
    account: req.session.account, 
    strings: { common: commonAppStrings, storage: storageAppStrings }
  });
});

/****************************************************************************************************/

module.exports = router;