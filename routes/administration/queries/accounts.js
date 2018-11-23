'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const success               = require(`${__root}/json/success`);
const constants             = require(`${__root}/functions/constants`);
const commonAccountsCreate  = require(`${__root}/functions/common/accounts/create`);
const commonAccountsUpdate  = require(`${__root}/functions/common/accounts/update`);

var router = express.Router();

/****************************************************************************************************/

router.post('/create-account', (req, res) =>
{
  if(req.body.accountEmail == undefined)      return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'accountEmail' });
  if(req.body.accountLastname == undefined)   return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'accountLastname' });
  if(req.body.accountFirstname == undefined)  return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'accountFirstname' });

  if(req.app.locals.account.isAdmin == false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  commonAccountsCreate.createAccount(req.body.accountEmail, req.body.accountLastname, req.body.accountFirstname, req.app.get('databaseConnectionPool'), req.app.get('params'), req.app.get('transporter'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(201).send({ message: success[constants.ACCOUNT_SUCCESSFULLY_CREATED] });
  });
});

/****************************************************************************************************/

router.put('/update-account-suspension-status', (req, res) =>
{
  if(req.body.accountUuid == undefined)       return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'accountUuid' });
  if(req.body.isToBeSuspended == undefined)   return res.status(406).send({ message: errors[constants.MISSIGN_DATA_IN_REQUEST], detail: 'isToBeSuspended' });

  if(req.app.locals.account.isAdmin == false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  if(req.body.isToBeSuspended !== 'true' && req.body.isToBeSuspended !== 'false') return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'isToBeSuspended' });

  commonAccountsUpdate.updateSuspensionStatus(req.body.accountUuid, req.body.isToBeSuspended === 'true', req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ message: req.body.isToBeSuspended === 'true' ? success[constants.ACCOUNT_SUCCESSFULLY_SUSPENDEDED] : success[constants.ACCOUNT_SUCCESSFULLY_REHABILITATED] });
  });
});

/****************************************************************************************************/

module.exports = router;