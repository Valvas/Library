'use strict'

const params                = require(`${__root}/json/params`);
const errors                = require(`${__root}/json/errors`);
const accounts              = require(`${__root}/json/accounts`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const accountsCheck         = require(`${__root}/functions/accounts/check`);
const accountsCreate        = require(`${__root}/functions/accounts/create`);
const accountsUpdate        = require(`${__root}/functions/accounts/update`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);
const commonRightsUpdate    = require(`${__root}/functions/common/rights/update`);
const commonRightsCreate    = require(`${__root}/functions/common/rights/create`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.createRights = (databaseConnector, callback) =>
{
  if(databaseConnector == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else
  {
    var x = 0;

    var createRightsLoop = () =>
    {
      accountsGet.getAccountUsingEmail(accounts[x].email, databaseConnector, (error, account) =>
      {
        if(error != null)
        {
          console.log(`[RIGHTS] - Error - could not create rights for account "${accounts[x].email}" (${errors[error.code]})`);
          accounts[x += 1] == undefined ? callback(null) : createRightsLoop();
        }

        else
        {
          accounts[x].id = account.id;

          commonAppsAccess.getAppsAvailableForAccount(account.id, databaseConnector, (error, rights) =>
          {
            if(error != null)
            {
              if(error.status != 404)
              {
                console.log(`[RIGHTS] - Error - could not create rights for account "${accounts[x].email}" (${errors[error.code]})`);
                accounts[x += 1] == undefined ? callback(null) : createRightsLoop();
              }

              //Account rights do not exist and must be created
              else
              {
                commonRightsCreate.createAppsAccessRights(accounts[x], databaseConnector, (error) =>
                {
                  if(error != null)
                  {
                    console.log(`[RIGHTS] - Error - could not create rights for account "${accounts[x].email}" (${errors[error.code]})`);
                    accounts[x += 1] == undefined ? callback(null) : createRightsLoop();
                  }

                  else
                  {
                    console.log(`[RIGHTS] - Creation - rights successfully created for account "${accounts[x].email}"`);
                    accounts[x += 1] == undefined ? callback(null) : createRightsLoop();
                  }
                });
              }
            }

            //Account rights exist and must be updated
            else
            {
              commonRightsUpdate.updateAppsAccessRights(accounts[x], databaseConnector, (error) =>
              {
                if(error != null)
                {
                  console.log(`[RIGHTS] - Error - could not create rights for account "${accounts[x].email}" (${errors[error.code]})`);
                  accounts[x += 1] == undefined ? callback(null) : createRightsLoop();
                }

                else
                {
                  console.log(`[RIGHTS] - Update - rights successfully updated for account "${accounts[x].email}"`);
                  accounts[x += 1] == undefined ? callback(null) : createRightsLoop();
                }
              });
            }
          });
        }
      });
    }

    if(accounts[x] == undefined)
    {
      console.log('[RIGHTS] - Info - no rights to create');
      callback(null);
    }

    else
    {
      createRightsLoop();
    }
  }
}

/****************************************************************************************************/