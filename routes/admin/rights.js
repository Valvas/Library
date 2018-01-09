'use strict';

var express         = require('express');
var errors          = require(`${__root}/json/errors`);
var adminUsers      = require(`${__root}/functions/admin/users`);
var adminRights     = require(`${__root}/functions/admin/rights`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  adminUsers.getAccountList(req.app.get('mysqlConnector'), (accountsOrFalse, errorStatus, errorCode) =>
  {
    accountsOrFalse == false ?
    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
    res.render('./admin/rights/users', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'rights', users: accountsOrFalse });
  });
});

/****************************************************************************************************/

router.get('/:account', (req, res) =>
{
  adminUsers.getAccountFromUUID(req.params.account, req.app.get('mysqlConnector'), (accountOrFalse, errorStatus, errorCode) =>
  {
    accountOrFalse == false ?

    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

    res.render('./admin/rights/services', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'rights', services: require(`${__root}/json/services`), account: accountOrFalse });
  });
});

/****************************************************************************************************/

router.get('/:account/:service', (req, res) =>
{
  adminUsers.getAccountFromUUID(req.params.account, req.app.get('mysqlConnector'), (accountOrFalse, errorStatus, errorCode) =>
  {
    accountOrFalse == false ?

    res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

    adminRights.getAccountRightsForOneServiceUsingUUID(req.params.account, req.params.service, req.app.get('mysqlConnector'), (rightsOrFalse, errorStatus, errorCode) =>
    {
      rightsOrFalse == false ?

      res.render('block', { message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :

      res.render('./admin/rights/detail', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'rights', services: require(`${__root}/json/services`), account: accountOrFalse, rights: rightsOrFalse });
    });
  });
});

/****************************************************************************************************/

module.exports = router;