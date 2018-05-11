'use strict'

const express                         = require('express');
const errors                          = require(`${__root}/json/errors`);
const success                         = require(`${__root}/json/success`);
const adminAppStrings                 = require(`${__root}/json/strings/admin`);
const constants                       = require(`${__root}/functions/constants`);
const accountsGet                     = require(`${__root}/functions/accounts/get`);
const adminAppRightsGet               = require(`${__root}/functions/admin/rights/get`);
const adminAppRightsAdd               = require(`${__root}/functions/admin/rights/add`);
const adminAppRightsRemove            = require(`${__root}/functions/admin/rights/remove`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-session-rights', (req, res) =>
{
  adminAppRightsGet.getAccountRights(req.session.account.id, req.app.get('mysqlConnector'), (error, rights) =>
  {
    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    else
    {
      delete rights.id;
      delete rights.account;

      res.status(200).send({ rights: rights });
    }
  });
});

/****************************************************************************************************/

router.post('/update-right', (req, res) =>
{
  if(req.body.rightToUpdate == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'the right to update is missing from the request' });

  else if(req.body.isToBeRemoved == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'the update status is missing from the request' });

  else if(req.body.isToBeRemoved != true && req.body.isToBeRemoved != false) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'the argument "isToBeRemoved" must be a boolean' });

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

          else if(req.body.isToBeRemoved == true && rights.remove_rights == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_REMOVE_RIGHTS], detail: null });

          else if(req.body.isToBeRemoved == false && rights.add_rights == 0) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_ADD_RIGHTS], detail: null });

          else
          {
            if(req.body.isToBeRemoved == true)
            {
              adminAppRightsRemove.removeRight(req.body.rightToUpdate, account.id, req.app.get('mysqlConnector'), (error) =>
              {
                if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                else
                {
                  adminAppRightsGet.getAccountRights(account.id, req.app.get('mysqlConnector'), (error, rights) =>
                  {
                    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                    else
                    {
                      res.status(200).send({ message: success[constants.RIGHT_SUCCESSFULLY_REMOVED], rights: rights });
                    }
                  });
                }
              });
            }

            else
            {
              adminAppRightsAdd.addRight(req.body.rightToUpdate, account.id, req.app.get('mysqlConnector'), (error) =>
              {
                if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                else
                {
                  adminAppRightsGet.getAccountRights(account.id, req.app.get('mysqlConnector'), (error, rights) =>
                  {
                    if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

                    else
                    {
                      res.status(200).send({ message: success[constants.RIGHT_SUCCESSFULLY_ADDED], rights: rights });
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