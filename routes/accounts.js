'use strict'

const express           = require('express');
const errors            = require(`${__root}/json/errors`);
const constants         = require(`${__root}/functions/constants`);
const commonAccountsGet = require(`${__root}/functions/common/accounts/get`);

const router = express.Router();

/****************************************************************************************************/

router.put('/get-account-from-uuid', (req, res) =>
{
  if(req.body.accountUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: null });

  else
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(req.body.accountUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else if(accountExists == false) res.status(404).send({ message: errors[constants.ACCOUNT_NOT_FOUND], detail: null });

      else
      {
        res.status(200).send({ account: accountData });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;