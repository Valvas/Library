'use strict';

let express = require('express');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  res.render('./admin/params', { links: require('../../json/admin').aside, location: 'params' });
});

/****************************************************************************************************/

module.exports = router;