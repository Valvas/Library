'use strict'

const express                         = require('express');
const storageAppStrings               = require(`${__root}/json/strings/storage`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.status(200).send({ result: true, strings: storageAppStrings });
});

/****************************************************************************************************/

module.exports = router;