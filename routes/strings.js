'use strict'

const express                 = require('express');
const sickStrings             = require(`${__root}/json/strings/sick`);
const commonStrings           = require(`${__root}/json/strings/common`);
const storageStrings          = require(`${__root}/json/strings/storage`);
const administrationStrings   = require(`${__root}/json/strings/administration`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-storage', (req, res) =>
{
  res.status(200).send({ common: commonStrings, storage: storageStrings });
});

/****************************************************************************************************/

router.get('/get-common', (req, res) =>
{
  res.status(200).send({ strings: commonStrings });
});

/****************************************************************************************************/

router.get('/get-administration', (req, res) =>
{
  res.status(200).send({ strings: administrationStrings });
});

/****************************************************************************************************/

router.get('/get-sick', (req, res) =>
{
  res.status(200).send({ common: commonStrings, app: sickStrings });
});

/****************************************************************************************************/

module.exports = router;
