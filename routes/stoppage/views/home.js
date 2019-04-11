'use strict'

const express                   = require('express');
const commonStrings             = require(`${__root}/json/strings/common`);
const stoppageAppStrings        = require(`${__root}/json/strings/stoppage`);

let router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('stoppage/index', { commonStrings: commonStrings, stoppageAppStrings: stoppageAppStrings });
});

/****************************************************************************************************/

router.get('/home', (req, res) =>
{
  res.render('stoppage/index', { commonStrings: commonStrings, stoppageAppStrings: stoppageAppStrings });
});

/****************************************************************************************************/

router.get('/list', (req, res) =>
{
  res.render('stoppage/index', { commonStrings: commonStrings, stoppageAppStrings: stoppageAppStrings });
});

/****************************************************************************************************/

router.get('/add', (req, res) =>
{
  res.render('stoppage/index', { commonStrings: commonStrings, stoppageAppStrings: stoppageAppStrings });
});

/****************************************************************************************************/

module.exports = router;
