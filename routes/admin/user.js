'use strict';

let express = require('express');

let errors           = require('../../json/errors');
let users            = require('../../functions/admin/users');

let router = express.Router();

/****************************************************************************************************/

router.get('/', function(req, res)
{
  users.getAccountList(req.app.get('mysqlConnector'), (trueOrFalse, rowsOrErrorCode) =>
  {
    trueOrFalse ?
    res.render('./admin/users', { links: require('../../json/admin').aside, location: 'users', users: rowsOrErrorCode, services: require('../../json/services') }) :
    res.render('block', { message: errors[rowsOrErrorCode].charAt(0).toUpperCase() + errors[rowsOrErrorCode].slice(1) });
  });
});

/****************************************************************************************************/

router.get('/:accountUUID', function(req, res)
{
  users.getAccountFromUUID(req.params.accountUUID, req.app.get('mysqlConnector'), (trueOrFalse, userObjectOrErrorCode) =>
  {
    trueOrFalse ?
    res.render('./admin/user', { links: require('../../json/admin').aside, location: 'users', account: userObjectOrErrorCode, services: require('../../json/services') }) :
    res.render('block', { message: errors[userObjectOrErrorCode].charAt(0).toUpperCase() + errors[userObjectOrErrorCode].slice(1) });
  });
});

/****************************************************************************************************/

module.exports = router;