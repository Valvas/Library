'use strict';

var express = require('express');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('./admin/menu', { links: require('../../json/admin').aside, navigationLocation: 'admin' });
});

/****************************************************************************************************/

router.get('/home', (req, res) =>
{
  res.render('./admin/home', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'home', news: require('../../json/admin_news') });
});

/****************************************************************************************************/

module.exports = router;