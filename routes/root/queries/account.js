'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonAccountsUpdate  = require(`${__root}/functions/common/accounts/update`);

var router = express.Router();

/****************************************************************************************************/

router.put('/update-email-address', (req, res) =>
{
  if(req.body.emailAddress == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'emailAddress' });

  commonAccountsUpdate.updateEmailAddress(req.body.emailAddress, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });
    
    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-lastname', (req, res) =>
{
  if(req.body.lastname == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'lastname' });

  commonAccountsUpdate.updateLastname(req.body.lastname, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-firstname', (req, res) =>
{
  if(req.body.firstname == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'firstname' });

  commonAccountsUpdate.updateFirstname(req.body.firstname, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-password', (req, res) =>
{
  if(req.body.oldPassword == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'oldPassword' });

  if(req.body.newPassword == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newPassword' });

  if(req.body.confirmationPassword == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'confirmationPassword' });

  commonAccountsUpdate.updatePassword(req.body.oldPassword, req.body.newPassword, req.body.confirmationPassword, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.put('/update-picture', (req, res) =>
{
  if(req.body.picture == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'picture' });

  commonAccountsUpdate.updatePicture(req.body.picture, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.get('/get-password-rules', (req, res) =>
{
  res.status(200).send({ passwordRules: req.app.get('params').passwordRules });
});

/****************************************************************************************************/

module.exports = router;