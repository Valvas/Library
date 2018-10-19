'use strict'

const express         = require('express');
const commonStrings   = require(`${__root}/json/strings/common`);
const storageStrings  = require(`${__root}/json/strings/storage`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-common', (req, res) =>
{
  res.status(200).send({ strings: commonStrings });
});

/****************************************************************************************************/

router.get('/get-storage', (req, res) =>
{
  res.status(200).send({ strings: storageStrings });
});

/****************************************************************************************************/

module.exports = router;