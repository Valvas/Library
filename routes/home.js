'use strict';

var express = require('express');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.uuid == undefined ? res.redirect('/') : res.render('home', { navigationLocation: 'home', asideLocation: '', links: require('../json/services'), news: require('../json/news') });
});

/****************************************************************************************************/

module.exports = router;