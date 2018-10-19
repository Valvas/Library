'use strict'

const express               = require('express');
const jwt                   = require('jsonwebtoken');
const params                = require(`${__root}/json/config`);
const errors                = require(`${__root}/json/errors`);
const success               = require(`${__root}/json/success`);
const constants             = require(`${__root}/functions/constants`);
const accountsReset         = require(`${__root}/functions/accounts/reset`);
const accountsCreate        = require(`${__root}/functions/accounts/create`);
const commonAccountsCheck   = require(`${__root}/functions/common/accounts/check`);

const commonTokenGet        = require(`${__root}/functions/common/token/get`);
const commonTokenCheck      = require(`${__root}/functions/common/token/check`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonTokenGet.getAuthTokenFromHeaders(req.headers.cookie, (error, token) =>
  {
    error != null ? res.render('root/index') :

    commonTokenCheck.checkIfTokenIsValid(token, req.app.get('params'), (error, decodedToken) =>
    {
      error != null
      ? res.render('root/index')
      : res.redirect('/home');
    });
  });
});

/****************************************************************************************************/

router.put('/', (req, res) =>
{
  commonAccountsCheck.checkIfAccountExistsFromCredentials(req.body.emailAddress, req.body.uncryptedPassword, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountData) =>
  {
    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    else
    {
      jwt.sign({ uuid: accountData.uuid }, req.app.get('params').tokenSecretKey, (error, token) =>
      {
        error != null
        ? res.status(406).send({ message: error.message, detail: null })
        : res.status(200).send({ token: token, maxAge: (60 * 60 * 24) });
      });
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

router.get('/afk-time', (req, res) =>
{
  req.session.account == undefined ? 
  res.status(401).send({ result: false, message: errors[constants.AUTHENTICATION_REQUIRED] }) : 
  res.status(200).send({ result: true, time: params.inactivity_timeout });
});

/****************************************************************************************************/

module.exports = router;