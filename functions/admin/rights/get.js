'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.getAccountRights = (accountID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    if(error != null) callback(error);

    else
    {
      commonAppsAccess.getAppsAvailableForAccount(accountID, databaseConnector, (error, access) =>
      {
        if(error != null) callback(error);

        else
        {
          if(access.admin == 0) callback({ status: 403, code: constants.RIGHTS_REQUIRED_TO_ACCESS_THIS_PAGE });

          else
          {
            databaseManager.selectQuery(
            {
              'databaseName': params.database.administration.label,
              'tableName': params.database.administration.tables.rights,
              'args': { '0': '*' },
              'where': { '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID } } }

            }, databaseConnector, (boolean, rightsOrErrorMessage) =>
            {
              if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: rightsOrErrorMessage });
      
              else
              {
                if(rightsOrErrorMessage.length == 0) callback({ status: 404, code: constants.RIGHTS_NOT_FOUND });
      
                else
                {
                  callback(null, rightsOrErrorMessage[0]);
                }
              }
            });
          }
        }
      });
    }
  });
}

/****************************************************************************************************/