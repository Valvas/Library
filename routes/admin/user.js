'use strict';

let express = require('express');

let users = require('../../functions/admin/users');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  users.getAccountList(req.app.get('mysqlConnector'), function(result)
  {
    res.render('./admin/users', { links: require('../../json/admin').aside, location: 'users', users: result, services: require('../../json/services') });
  });
});

/****************************************************************************************************/

module.exports = router;