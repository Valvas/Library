'use strict';

var express = require('express');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('./admin/news', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'news' });
});

/****************************************************************************************************/

module.exports = router;