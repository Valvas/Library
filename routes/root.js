'use strict'

const express               = require('express');
const jwt                   = require('jsonwebtoken');
const errors                = require(`${__root}/json/errors`);
const success               = require(`${__root}/json/success`);
const commonStrings         = require(`${__root}/json/strings/common`);
const constants             = require(`${__root}/functions/constants`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);
const commonAccountsCheck   = require(`${__root}/functions/common/accounts/check`);
const commonAccountsUpdate  = require(`${__root}/functions/common/accounts/update`);

const commonTokenGet        = require(`${__root}/functions/common/token/get`);
const commonTokenCheck      = require(`${__root}/functions/common/token/check`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonTokenGet.getAuthTokenFromHeaders(req.headers.cookie, (error, token) =>
  {
    error != null ? res.render('root/index', { currentLocation: 'logon', strings: { common: commonStrings } }) :

    commonTokenCheck.checkIfTokenIsValid(token, req.app.get('params'), (error, decodedToken) =>
    {
      error != null
      ? res.render('root/index', { currentLocation: 'logon', strings: { common: commonStrings } })
      : res.redirect('/home');
    });
  });
});

/****************************************************************************************************/

router.put('/', (req, res) =>
{
  commonAccountsCheck.checkIfAccountExistsFromCredentials(req.body.emailAddress, req.body.uncryptedPassword, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    jwt.sign({ uuid: accountData.uuid }, req.app.get('params').tokenSecretKey, (error, token) =>
    {
      error != null
      ? res.status(406).send({ message: error.message, detail: null })
      : res.status(200).send({ token: token, maxAge: (60 * 60 * 24) });
    });
  });
});

/****************************************************************************************************/

router.post('/', (req, res) =>
{
  req.body.email == undefined || req.body.lastname == undefined || req.body.firstname == undefined || req.body.service == undefined || req.body.admin == undefined ?

  res.status(406).send({ result: false, message: errors[10009] }) :

  accountsCreate.createAccount(req.body, req.app.get('databaseConnectionPool'), req.app.get('transporter'), req.app.get('params'), (error) =>
  {
    error == null ?
    res.status(201).send({ result: true, message: success[constants.ACCOUNT_SUCCESSFULLY_CREATED] }) :
    res.status(error.status).send({ result: false, message: errors[error.code] });
  });
});

/****************************************************************************************************/

router.get('/reset-password', (req, res) =>
{
  res.render('root/reset', { strings: { common: commonStrings } });
});

/****************************************************************************************************/

router.put('/reset-password', (req, res) =>
{
  if(req.body.email === undefined)
  {
    return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'emailAddress' });
  }

  commonAccountsGet.checkIfAccountExistsFromEmail(req.body.email, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
  {
    if(error !== null)
    {
      return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    }

    if(accountExists === false)
    {
      return res.status(404).send({ message: errors[constants.ACCOUNT_NOT_FOUND], detail: null });
    }

    if(accountData.suspended === 1)
    {
      return res.status(403).send({ message: errors[constants.ACCOUNT_SUSPENDED], detail: null });
    }

    commonAccountsUpdate.resetPassword(accountData.uuid, req.body.email, req.app.get('databaseConnectionPool'), req.app.get('transporter'), req.app.get('params'), (error) =>
    {
      if(error !== null)
      {
        return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
      }

      return res.status(200).send({ message: success[constants.NEW_PASSWORD_SENT] });
    });
  });
});

/****************************************************************************************************/

module.exports = router;
