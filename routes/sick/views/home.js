'use strict'

const express                   = require('express');
const commonStrings             = require(`${__root}/json/strings/common`);
const sickAppStrings            = require(`${__root}/json/strings/sick`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('sick/index', { commonStrings: commonStrings, sickAppStrings: sickAppStrings });
});

/****************************************************************************************************/

router.get('/home', (req, res) =>
{
  res.render('sick/index', { commonStrings: commonStrings, sickAppStrings: sickAppStrings });
});

/****************************************************************************************************/

module.exports = router;
