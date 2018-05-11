'use strict'

const express           = require('express');
const errors            = require(`${__root}/json/errors`);
const constants         = require(`${__root}/functions/constants`);
const accountsGet       = require(`${__root}/functions/accounts/get`);

const router = express.Router();

/****************************************************************************************************/

router.post('/get-account-from-uuid', (req, res) =>
{
  accountsGet.getAccountUsingUUID (req.body.accountUUID, req.app.get('mysqlConnector'), (error, account) =>
  {
    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    else
    {
      res.status(200).send({ account: account });
    }
  });
});

/****************************************************************************************************/

module.exports = router;