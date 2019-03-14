'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonUnitsGet        = require(`${__root}/functions/common/units/get`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('*', (req, res) =>
{
  res.render('root/home', { strings: { common: commonStrings }});
});

/****************************************************************************************************/

module.exports = router;
