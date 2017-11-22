'use strict';

let express = require('express');

let account = require('../functions/accounts/functions');

let router = express.Router();

/****************************************************************************************************/

router.get('/get-aside-links', function(req, res)
{
  res.status(200).send(require('../json/services.json'));
});

/****************************************************************************************************/

module.exports = router;