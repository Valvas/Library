'use strict'

const express                         = require('express');
const adminAppStrings                 = require(`${__root}/json/strings/admin`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.status(200).send({ result: true, strings: adminAppStrings });
});

/****************************************************************************************************/

module.exports = router;