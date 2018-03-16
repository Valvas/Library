'use strict'

const express                   = require('express');
const params                    = require(`${__root}/json/params`);
const errors                    = require(`${__root}/json/errors`);
const constants                 = require(`${__root}/functions/constants`);
const commonAppStrings          = require(`${__root}/json/strings/common`);
const storageAppStrings         = require(`${__root}/json/strings/storage`);
const accessGet                 = require(`${__root}/functions/access/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-accounts-that-have-access-to-the-app', (req, res) =>
{
  if(req.app.locals.rights.create_services == 0) res.status(403).send({ result: false, message: errors[constants.RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE] });

  else
  {
    accessGet.getAccountsThatHaveAccessToStorageApp(req.app.get('mysqlConnector'), (error, accounts) =>
    {
      if(error != null) res.status(error.status).send({ result: false, message: errors[error.code], detail: error.detail == undefined ? null : error.detail });

      else
      {
        res.status(200).send({ result: true, accounts: accounts });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;