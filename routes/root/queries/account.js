'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonAccountsUpdate  = require(`${__root}/functions/common/accounts/update`);

var router = express.Router();

/****************************************************************************************************/

router.put('/update-email-address', (req, res) =>
{
  if(req.body.emailAddress == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'emailAddress' });

  else
  {
    commonAccountsUpdate.updateEmailAddress(req.body.emailAddress, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      error != null
      ? res.status(error.status).send({ message: errors[error.code], detail: error.detail })
      : res.status(200).send({  });
    }); 
  }
});

/****************************************************************************************************/

router.put('/update-lastname', (req, res) =>
{
  if(req.body.lastname == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'lastname' });

  else
  {
    commonAccountsUpdate.updateLastname(req.body.lastname, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      error != null
      ? res.status(error.status).send({ message: errors[error.code], detail: error.detail })
      : res.status(200).send({  });
    }); 
  }
});

/****************************************************************************************************/

router.put('/update-firstname', (req, res) =>
{
  if(req.body.firstname == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'firstname' });

  else
  {
    commonAccountsUpdate.updateFirstname(req.body.firstname, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      error != null
      ? res.status(error.status).send({ message: errors[error.code], detail: error.detail })
      : res.status(200).send({  });
    }); 
  }
});

/****************************************************************************************************/

router.put('/update-password', (req, res) =>
{
  if(req.body.oldPassword == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'oldPassword' });

  else if(req.body.newPassword == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newPassword' });

  else if(req.body.confirmationPassword == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'confirmationPassword' });

  else
  {
    commonAccountsUpdate.updatePassword(req.body.oldPassword, req.body.newPassword, req.body.confirmationPassword, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {
      error != null
      ? res.status(error.status).send({ message: errors[error.code], detail: error.detail })
      : res.status(200).send({  });
    }); 
  }
});

/****************************************************************************************************/

module.exports = router;