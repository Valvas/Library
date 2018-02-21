'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('storage/home',
  { 
    account: req.session.account, 
    strings: { navigation: commonStrings.navigation }
  });
});

/****************************************************************************************************/

module.exports = router;