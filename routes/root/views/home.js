'use strict'

const express               = require('express');
const commonStrings         = require(`${__root}/json/strings/common`);

var router = express.Router();

/****************************************************************************************************/

router.get('*', (req, res) =>
{
  res.render('root/home', { currentLocation: 'home', strings: { common: commonStrings }});
});

/****************************************************************************************************/

module.exports = router;
