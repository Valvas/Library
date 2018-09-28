'use strict'

const express       = require('express');
const commonStrings = require(`${__root}/json/strings/common`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-common', (req, res) =>
{
  res.status(200).send({ strings: commonStrings });
});

/****************************************************************************************************/

module.exports = router;