'use strict';

var express = require('express');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('./admin/rights', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'rights' });
});

/****************************************************************************************************/

module.exports = router;