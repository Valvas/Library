'use strict';

let express = require('express');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  res.render('./admin/home', { links: require('../../json/admin').aside, location: 'admin', news: require('../../json/admin_news') });
});

/****************************************************************************************************/

module.exports = router;