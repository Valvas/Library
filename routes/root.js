'use strict';

var express           = require('express');
var params            = require(`${__root}/json/config`);
var errors            = require(`${__root}/json/errors`);
var success           = require(`${__root}/json/success`);
var logon             = require(`${__root}/functions/logon`);
var constants         = require(`${__root}/functions/constants`);
var accountsReset     = require(`${__root}/functions/accounts/reset`);
var accountsCreate    = require(`${__root}/functions/accounts/create`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.uuid == undefined ? res.render('index') : res.redirect('/home');
});

/****************************************************************************************************/

router.put('/', (req, res) =>
{
  req.body.emailAddress == undefined || req.body.uncryptedPassword == undefined ? 
  
  res.status(406).send({ result: false, message: errors[constants.MISSING_DATA_IN_REQUEST] }) :

  logon.checkIfAccountExistsUsingCredentialsProvided(req.body.emailAddress, req.body.uncryptedPassword, req.app.get('mysqlConnector'), (accountOrFalse, errorStatus, errorCode) =>
  {
    if(accountOrFalse == false) res.status(errorStatus).send({ result: false, message: errors[errorCode] });

    else
    {
      if(accountOrFalse.suspended == 1) res.status(403).send({ result: false, message: errors[constants.ACCOUNT_SUSPENDED] });

      else
      {
        req.session.uuid = accountOrFalse.uuid;
        req.session.account = accountOrFalse;

        res.status(200).send({ result: true });
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
  req.session.uuid == undefined ? 
  res.status(401).send({ result: false, message: `Erreur [401] - ${constants.AUTHENTICATION_REQUIRED} !`}) : 
  res.status(200).send({ result: true, time: params.inactivity_timeout });
});

/****************************************************************************************************/

module.exports = router;