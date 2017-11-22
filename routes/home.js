'use strict';

let express = require('express');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  req.session.identifier == undefined ? res.redirect('/') : res.render('home');
});

/****************************************************************************************************/

router.get('/get-last-news', function(req, res)
{
  res.status(200).send(require('../json/news.json'));
});

/****************************************************************************************************/

module.exports = router;