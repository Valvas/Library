'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonAppsGet         = require(`${__root}/functions/common/apps/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-account-apps', (req, res) =>
{
  commonAppsGet.getAccountApps(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountApps) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    res.status(200).send({ accountApps: accountApps });
  });
});

/****************************************************************************************************/

module.exports = router;
