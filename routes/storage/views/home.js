'use strict'

const express                   = require('express');
const commonStrings             = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('storage/home', { commonStrings: commonStrings, storageAppStrings: storageAppStrings });
});

/****************************************************************************************************/

router.get('/home', (req, res) =>
{
  res.render('storage/home', { commonStrings: commonStrings, storageAppStrings: storageAppStrings });
});

/****************************************************************************************************/

module.exports = router;
