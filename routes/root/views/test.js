'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
    res.render('root/test', { currentLocation: 'home', strings: { common: commonStrings }});
});

/****************************************************************************************************/

module.exports = router;
