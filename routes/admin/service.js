'use strict';

let express = require('express');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  res.render('./admin/services', { links: require('../../json/admin').aside, location: 'services', services: require('../../json/services') });
});

/****************************************************************************************************/

module.exports = router;