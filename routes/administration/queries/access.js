'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const success               = require(`${__root}/json/success`);
const constants             = require(`${__root}/functions/constants`);
const commonAccessUpdate    = require(`${__root}/functions/common/access/update`);

var router = express.Router();

/****************************************************************************************************/

router.put('/add-access-to-app', (req, res) =>
{
  if(req.body.appName == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'appName' });
  if(req.body.accountUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'accountUuid' });

  if(req.app.locals.account.isAdmin == false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  if(req.app.get('params').database[req.body.appName] == undefined) return res.status(404).send({ message: errors[constants.APP_NOT_FOUND], detail: null });

  commonAccessUpdate.addAccessToAppForAccount(req.body.accountUuid, req.body.appName, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ message: success[constants.APP_ACCESS_SUCESSFULLY_ADDED] });
  });
});

/****************************************************************************************************/

router.put('/remove-access-to-app', (req, res) =>
{
  if(req.body.appName == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'appName' });
  if(req.body.accountUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'accountUuid' });

  if(req.app.locals.account.isAdmin == false) return res.status(403).send({ message: errors[constants.USER_IS_NOT_ADMIN], detail: null });

  if(req.app.get('params').database[req.body.appName] == undefined) return res.status(404).send({ message: errors[constants.APP_NOT_FOUND], detail: null });

  commonAccessUpdate.removeAccessToAppForAccount(req.body.accountUuid, req.body.appName, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ message: success[constants.APP_ACCESS_SUCESSFULLY_REMOVED] });
  });
});

/****************************************************************************************************/

module.exports = router;