'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const adminAppStrings       = require(`${__root}/json/strings/admin`);
const commonAppStrings      = require(`${__root}/json/strings/common`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('admin/home',
  { 
    account: req.session.account, 
    strings: { common: commonAppStrings, admin: adminAppStrings }
  });
});

/****************************************************************************************************/

module.exports = router;