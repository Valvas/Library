'use strict';

let express = require('express');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  req.session.identifier == undefined ? res.redirect('/') : res.render('home', { location: 'home', links: require('../json/services'), news: require('../json/news') });
});

/****************************************************************************************************/

module.exports = router;