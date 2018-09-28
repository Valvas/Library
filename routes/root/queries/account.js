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
    commonAccountsUpdate.updateEmailAddress(req.body.emailAddress, req.session.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
    {

    }); 
  }
});

/****************************************************************************************************/

module.exports = router;