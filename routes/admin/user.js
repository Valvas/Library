'use strict';

var express          = require('express');
var errors           = require(`${__root}/json/errors`);
var adminUsers       = require(`${__root}/functions/admin/users`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  adminUsers.getAccountList(req.app.get('mysqlConnector'), (accountsOrFalse, errorStatus, errorCode) =>
  {
    accountsOrFalse == false ?
    res.render('block', { message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` }) :
    res.render('./admin/users', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'users', users: accountsOrFalse, services: require('../../json/services') });
  });
});

/****************************************************************************************************/

router.get('/:accountUUID', (req, res) =>
{
  adminUsers.getAccountFromUUID(req.params.accountUUID, req.app.get('mysqlConnector'), (accountOrFalse, errorStatus, errorCode) =>
  {
    accountOrFalse == false ?
    res.render('block', { message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` }) :
    res.render('./admin/user', { links: require('../../json/admin').aside, location: 'users', account: accountOrFalse, services: require('../../json/services') });
  });
});

/****************************************************************************************************/

module.exports = router;