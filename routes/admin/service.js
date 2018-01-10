'use strict';

var express = require('express');

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  res.render('./admin/services', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'services', services: require('../../json/services') });
});

/****************************************************************************************************/

module.exports = router;