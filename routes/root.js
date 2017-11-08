'use strict';

let express = require('express');

let router = express.Router();

router.get('/', function(req, res)
{
  res.render('index');
});

router.put('/', function(req, res)
{
  
});

module.exports = router;