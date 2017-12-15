'use strict';

var express           = require('express');
var params            = require(`${__root}/json/config`);
var errors            = require(`${__root}/json/errors`);
var logon             = require(`${__root}/functions/logon`);
var constants         = require(`${__root}/functions/constants`);

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
  
  res.status(406).send({ result: false, message: `Erreur [406] - ${errors[constants.MISSING_DATA_IN_REQUEST]} !` }) :

  logon.checkIfAccountExistsUsingCredentialsProvided(req.body.emailAddress, req.body.uncryptedPassword, req.app.get('mysqlConnector'), (accountOrFalse, errorStatus, errorCode) =>
  {
    if(accountOrFalse == false) res.status(errorStatus).send({ result: false, message: `Erreur [${errorStatus}] - ${errors[errorCode]} !` });

    else
    {
      if(accountOrFalse.activated == 0) res.status(403).send({ result: false, message: `${errors[constants.ACCOUNT_NOT_ACTIVATED].charAt(0).toUpperCase()}${errors[constants.ACCOUNT_NOT_ACTIVATED].slice(1)}` });
      else if(accountOrFalse.suspended == 1) res.status(403).send({ result: false, message: `${errors[constants.ACCOUNT_SUSPENDED].charAt(0).toUpperCase()}${errors[constants.ACCOUNT_SUSPENDED].slice(1)}` });

      else
      {
        req.session.uuid = accountOrFalse.uuid;

        res.status(200).send({ result: true });
      }
    }
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