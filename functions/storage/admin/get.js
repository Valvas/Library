'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const storageAppServicesGet = require(`${__root}/functions/storage/services/get`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const oldDatabaseManager    = require(`${__root}/functions/database/MySQLv2`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

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
      oldDatabaseManager.selectQuery(
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

module.exports.getServicesDetailForConsultation = (databaseConnectionPool, callback) =>
{
  storageAppServicesGet.getAllServices(databaseConnectionPool, (error, services) =>
  {
    if(error != null) return callback(error);

    var x = 0;

    var browseServices = () =>
    {
      storageAppServicesGet.getMembersFromService(Object.keys(services)[x], databaseConnectionPool, (error, members) =>
      {
        if(error != null) return callback(error);

        services[Object.keys(services)[x]].members = {};
        services[Object.keys(services)[x]].members = members;

        if(Object.keys(services)[x += 1] == null) return callback(null, services);

        browseServices();
      });
    }

    if(Object.keys(services).length == 0) return callback(null, services);

    browseServices();
  });
}

/****************************************************************************************************/