'use strict';

var express          = require('express');
var errors           = require(`${__root}/json/errors`);
var success          = require(`${__root}/json/success`);
var constants        = require(`${__root}/functions/constants`);
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

router.get('/create', (req, res) =>
{
  res.render('./admin/create_user', { links: require('../../json/admin').aside, navigationLocation: 'admin', asideLocation: 'users', services: require('../../json/services') })
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

router.put('/update', (req, res) =>
{
  if(req.body.key == undefined) res.status(404).send({ result: false, message: `${errors[10009].charAt(0).toUpperCase()}${errors[10009].slice(1)}` });

  else
  {
    switch(req.body.key)
    {
      case 'email':

        adminUsers.updateEmail(req.body.account, req.body.value, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
        {
          boolean ?
          res.status(200).send({ result: true, message: `${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].charAt(0).toUpperCase()}${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].slice(1)}` }) :
          res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
        });
      
        break;

      case 'lastname':

        adminUsers.updateLastname(req.body.account, req.body.value, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
        {
          boolean ?
          res.status(200).send({ result: true, message: `${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].charAt(0).toUpperCase()}${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].slice(1)}` }) :
          res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
        });
      
        break;

      case 'firstname':

        adminUsers.updateFirstname(req.body.account, req.body.value, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
        {
          boolean ?
          res.status(200).send({ result: true, message: `${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].charAt(0).toUpperCase()}${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].slice(1)}` }) :
          res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
        });
      
        break;

      case 'service':

        adminUsers.updateService(req.body.account, req.body.value, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
        {
          boolean ?
          res.status(200).send({ result: true, message: `${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].charAt(0).toUpperCase()}${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].slice(1)}` }) :
          res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
        });
      
        break;

      case 'is_admin':

        adminUsers.updateAdminStatus(req.body.account, req.body.value, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
        {
          boolean ?
          res.status(200).send({ result: true, message: `${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].charAt(0).toUpperCase()}${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].slice(1)}` }) :
          res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
        });
      
        break;

      case 'suspended':

        adminUsers.updateSuspendedStatus(req.body.account, req.body.value, req.app.get('mysqlConnector'), (boolean, errorStatus, errorCode) =>
        {
          boolean ?
          res.status(200).send({ result: true, message: `${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].charAt(0).toUpperCase()}${success[constants.ACCOUNT_UPDATED_SUCCESSFULLY].slice(1)}` }) :
          res.status(errorStatus).send({ result: false, message: `${errors[errorCode].charAt(0).toUpperCase()}${errors[errorCode].slice(1)}` });
        });
      
        break;

      default:

        res.status(406).send({ result: false, message: `${errors[10040].charAt(0).toUpperCase()}${errors[10040].slice(1)}` });

        break;
    }
  }
});

/****************************************************************************************************/

module.exports = router;