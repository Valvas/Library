'use strict';

var express = require('express');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('./admin/params', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'params' });
});

/****************************************************************************************************/

module.exports = router;