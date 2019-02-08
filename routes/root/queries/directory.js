'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonUnitsGet        = require(`${__root}/functions/common/units/get`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-directory-tree', (req, res) =>
{
  commonUnitsGet.getDirectory(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, directoryObject) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send(directoryObject);
  });
});

/****************************************************************************************************/

router.get('/get-directory-accounts', (req, res) =>
{
  commonAccountsGet.getAccountsWithUnit(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ accounts: accounts });
  });
});

/****************************************************************************************************/

router.post('/get-account-profile', (req, res) =>
{
  if(req.body.accountUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'accountUuid' });

  commonAccountsGet.checkIfAccountExistsFromUuid(req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(accountExists == false) return res.status(error.status).send({ message: errors[constants.ACCOUNT_NOT_FOUND], detail: null });

    commonUnitsGet.getAccountUnit(req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountUnit) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      accountData.unitName = accountUnit.name;

      return res.status(200).send(accountData);
    });
  });
});

/****************************************************************************************************/

module.exports = router;
