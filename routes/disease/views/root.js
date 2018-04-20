'use strict'

const express = require('express');

const diseaseStrings = require(__root + '/json/strings/disease');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('disease/home', { account: req.session.account, strings: diseaseStrings });
});

/****************************************************************************************************/

module.exports = router;