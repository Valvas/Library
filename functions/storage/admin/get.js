'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const storageAppServicesGet = require(`${__root}/functions/storage/services/get`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.getAccountAdminRights = (accountID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    if(error != null) callback(error);

    else
    {
      databaseManager.selectQuery(
      {
        'databaseName': params.database.storage.label,
        'tableName': params.database.storage.tables.admin,
        'args': { '0': '*' },
        'where': { '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID } } }

      }, databaseConnector, (boolean, rightsOrErrorMessage) =>
      {
        if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: rightsOrErrorMessage });

        else
        {
          if(rightsOrErrorMessage.length == 0) callback({ status: 403, code: constants.USER_IS_NOT_ADMIN });

          else
          {
            callback(null, rightsOrErrorMessage[0]);
          }
        }
      });
    }
  });
}

/****************************************************************************************************/

module.exports.getServicesDetailForConsultation = (databaseConnector, callback) =>
{
  if(databaseConnector == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else
  {
    storageAppServicesGet.getAllServices(databaseConnector, (error, services) =>
    {
      if(error != null) callback(error);

      else
      {
        var x = 0, servicesObject = {};

        var browseServicesLoop = () =>
        {
          storageAppServicesGet.getAmountOfFilesFromService(Object.keys(services)[x], databaseConnector, (error, amountOfFiles) =>
          {
            if(error != null) callback(error);

            else
            {
              storageAppServicesGet.getAmountOfMembersFromService(Object.keys(services)[x], databaseConnector, (error, amountOfMembers) =>
              {
                if(error != null) callback(error);

                else
                {
                  servicesObject[services[Object.keys(services)[x]].name] = {};
                  servicesObject[services[Object.keys(services)[x]].name].files = amountOfFiles;
                  servicesObject[services[Object.keys(services)[x]].name].members = amountOfMembers;
                  servicesObject[services[Object.keys(services)[x]].name].fileLimit = services[Object.keys(services)[x]].fileLimit;

                  services[Object.keys(services)[x += 1]] == undefined ? callback(null, servicesObject) : browseServicesLoop();
                }
              });
            }
          });
        }

        Object.keys(services).length == 0 ? callback(null, {}) : browseServicesLoop();
      }
    });
  }
}

/****************************************************************************************************/