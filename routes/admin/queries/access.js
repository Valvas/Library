'use strict'

const express                         = require('express');
const errors                          = require(`${__root}/json/errors`);
const success                         = require(`${__root}/json/success`);
const adminAppStrings                 = require(`${__root}/json/strings/admin`);
const constants                       = require(`${__root}/functions/constants`);
const accessAdd                       = require(`${__root}/functions/access/add`);
const accountsGet                     = require(`${__root}/functions/accounts/get`);
const accessRemove                    = require(`${__root}/functions/access/remove`);
const adminAppRightsGet               = require(`${__root}/functions/admin/rights/get`);
const commonAppsAccess                = require(`${__root}/functions/common/apps/access`);

var router = express.Router();

/****************************************************************************************************/

router.post('/update-access', (req, res) =>
{
  if(req.body.appAccessToUpdate == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'the application to which to give access is missing from the request' });

  else if(req.body.giveAccess == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'the update status is missing from the request' });

  else if(req.body.giveAccess != true && req.body.giveAccess != false) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'the argument "giveAccess" must be a boolean' });

  else if(req.body.accountUUID == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'the account is missing from the request' });

  else
  {
    accountsGet.getAccountUsingUUID(req.body.accountUUID, req.app.get('mysqlConnector'), (error, account) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        adminAppRightsGet.getAccountRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          else if(req.body.giveAccess == true && rights.add_access == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_GIVE_ACCESS_TO_APPS], detail: null });

          else if(req.body.giveAccess == false && rights.remove_access == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_REMOVE_ACCESS_TO_APPS], detail: null });

          else
          {
            if(req.body.giveAccess == true)
            {
              accessAdd.addAccess(req.body.appAccessToUpdate, account.id, req.app.get('mysqlConnector'), (error) =>
              {
                if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                else
                {
                  commonAppsAccess.getAppsAvailableForAccount(account.id, req.app.get('mysqlConnector'), (error, access) =>
                  {
                    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                    else
                    {
                      delete access.id;
                      delete access.account;
                      
                      res.status(200).send({ message: success[constants.ACCOUNT_ACCESS_SUCCESSFULLY_ADDED], access: access });
                    }
                  });
                }
              });
            }

            else
            {
              accessRemove.removeAccess(req.body.appAccessToUpdate, account.id, req.app.get('mysqlConnector'), (error) =>
              {
                if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                else
                {
                  commonAppsAccess.getAppsAvailableForAccount(account.id, req.app.get('mysqlConnector'), (error, access) =>
                  {
                    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                    else
                    {
                      delete access.id;
                      delete access.account;

                      res.status(200).send({ message: success[constants.ACCOUNT_ACCESS_SUCCESSFULLY_REMOVED], access: access });
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;