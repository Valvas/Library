'use strict';

var express = require('express');

var router = express.Router();

/****************************************************************************************************/

router.get('/home', (req, res) =>
{
  res.render('./admin/home', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'home', news: require('../../json/admin_news') });
});

/****************************************************************************************************/

module.exports = router;