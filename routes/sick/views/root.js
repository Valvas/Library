'use strict'

const express = require('express');

const sickStrings = require(__root + '/json/strings/sick');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('sick/home', { account: req.app.locals.account, strings: sickStrings });
});

/****************************************************************************************************/

module.exports = router;
