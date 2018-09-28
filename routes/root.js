'use strict'

var express           = require('express');
var params            = require(`${__root}/json/config`);
var errors            = require(`${__root}/json/errors`);
var success           = require(`${__root}/json/success`);
var constants         = require(`${__root}/functions/constants`);
var accountsReset     = require(`${__root}/functions/accounts/reset`);
var accountsCreate    = require(`${__root}/functions/accounts/create`);

const commonRightsGet = require(`${__root}/functions/common/rights/get`);

const accountsLogon   = require(`${__root}/functions/accounts/logon`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.account == undefined ? res.render('index') : res.redirect('/home');
});

/****************************************************************************************************/

router.put('/', (req, res) =>
{
  accountsLogon.authenticateAccountUsingCredentials(req.body.emailAddress, req.body.uncryptedPassword, req.app.get('mysqlConnector'), (error, account) =>
  {
    if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

    else
    {
      if(account.suspended == 1) res.status(403).send({ result: false, message: errors[constants.ACCOUNT_SUSPENDED] });

      else
      {
        commonRightsGet.checkIfRightsExistsForAccount(account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail});

          else if(rightsExist == false) res.status(404).send({ message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null});

          else
          {
            account.rights = {};
            account.rights.intranet = {};
            account.rights.intranet = rightsData;
            
            req.session.account = account;
            res.status(200).send({ result: true });
          }
        });
      }
    }
  });
});

/****************************************************************************************************/

router.post('/', (req, res) =>
{
  req.body.email == undefined || req.body.lastname == undefined || req.body.firstname == undefined || req.body.service == undefined || req.body.admin == undefined ? 
  
  res.status(406).send({ result: false, message: errors[10009] }) :

  accountsCreate.createAccount(req.body, req.app.get('mysqlConnector'), req.app.get('transporter'), req.app.get('params'), (error) =>
  {
    error == null ? 
    res.status(201).send({ result: true, message: success[constants.ACCOUNT_SUCCESSFULLY_CREATED] }) : 
    res.status(error.status).send({ result: false, message: errors[error.code] });
  });
});

/****************************************************************************************************/

router.get('/reset-password', (req, res) =>
{
  res.render('reset_password', { service: req.app.get('params').init.servicesStarted.transporter });
});

/****************************************************************************************************/

router.put('/reset-password', (req, res) =>
{
  req.body.email == undefined ? res.status(406).send({ result: false, message: errors[10009] }) :

  accountsReset.resetPassword(req.body.email, req.app.get('mysqlConnector'), req.app.get('transporter'), req.app.get('params'), (error) =>
  {
    error == null ?
    res.status(200).send({ result: true, message: success[constants.NEW_PASSWORD_SENT] }) :
    res.status(error.status).send({ result: false, message: errors[error.code] });
  });
});

/****************************************************************************************************/

router.get('/logout', (req, res) =>
{
  req.session.destroy();

  res.redirect('/');
});

/****************************************************************************************************/

router.get('/afk-time', (req, res) =>
{
  req.session.account == undefined ? 
  res.status(401).send({ result: false, message: errors[constants.AUTHENTICATION_REQUIRED] }) : 
  res.status(200).send({ result: true, time: params.inactivity_timeout });
});

/****************************************************************************************************/

module.exports = router;