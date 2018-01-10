'use strict';

var express         = require('express');
var errors          = require(`${__root}/json/errors`);
var success         = require(`${__root}/json/success`);
var constants       = require(`${__root}/functions/constants`);
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

router.put('/update-account-rights', (req, res) =>
{
  adminRights.updateAccountRightsTowardsService(req.body.account, req.body.service, { access: req.body.access, comment: req.body.comment, download: req.body.download, upload: req.body.upload, remove: req.body.remove, }, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
  {
    boolean == false ?
    res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` }) :
    res.status(200).send({ result: true, message: `${success[constants.ACCOUNT_RIGHTS_SUCCESSFULLY_UPDATED].charAt(0).toUpperCase()}${success[constants.ACCOUNT_RIGHTS_SUCCESSFULLY_UPDATED].slice(1)}` });
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

      res.render('./admin/rights/detail', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'rights', service: { key: req.params.service, value: require(`${__root}/json/services`)[req.params.service].name }, account: accountOrFalse, rights: rightsOrFalse });
    });
  });
});

/****************************************************************************************************/

module.exports = router;