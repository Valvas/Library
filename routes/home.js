'use strict';

let express = require('express');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  req.session.active ? res.render('home') : res.redirect('/');
});

/****************************************************************************************************/

router.get('/get-last-news', function(req, res)
{
  req.session.active ? res.status(200).send(require('../json/news.json')) : res.status(401).send('401 - AUTHENTICATION REQUIRED');
});

/****************************************************************************************************/

module.exports = router;