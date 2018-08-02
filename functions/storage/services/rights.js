'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const accountsGet         = require(`${__root}/functions/accounts/get`);
const oldDatabaseManager  = require(`${__root}/functions/database/${params.database.dbms}`);

const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

const storageAppServicesRights = module.exports = {};

/****************************************************************************************************/

storageAppServicesRights.getRightsTowardsServices = (accountId, databaseConnection, params, callback) =>
{
  accountId           == undefined ||
  databaseConnection  == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  accountsGet.getAccountUsingID(accountId, databaseConnection, (error, account) =>
  {
    if(error != null) return callback(error);

    databaseManager.selectQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.rights,
      args: [ '*' ],
      where: { operator: '=', key: 'account', value: accountId }
  
    }, databaseConnection, (error, rights) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      var x = 0;

      var rightsObject = {};

      var browseRights = () =>
      {
        rightsObject[rights[x].service] = {};
        rightsObject[rights[x].service].remove      = (rights[x].remove_files == 1);
        rightsObject[rights[x].service].upload      = (rights[x].upload_files == 1);
        rightsObject[rights[x].service].comment     = (rights[x].post_comments == 1);
        rightsObject[rights[x].service].download    = (rights[x].download_files == 1);

        if(rights[x += 1] == undefined) return callback(null, rightsObject);
        
        browseRights();
      }

      if(rights.length == 0) return callback(null, {});
      
      browseRights();
    });
  });
}

/****************************************************************************************************/

storageAppServicesRights.getRightsTowardsService = (serviceUuid, accountId, databaseConnection, params, callback) =>
{
  serviceUuid         == undefined ||
  accountId           == undefined ||
  databaseConnection  == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.rights,
    args: [ '*' ],
    where:
    {
      condition: 'AND',
      0: { operator: '=', key: 'account', value: accountId },
      1: { operator: '=', key: 'service', value: serviceUuid }
    }
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error.message });

    if(result.length == 0) return callback({ status: 406, code: constants.UNAUTHORIZED_TO_ACCESS_SERVICE, detail: null });

    var rightsObject = {};

    rightsObject.service     = result[0].service;
    rightsObject.remove      = result[0].remove_files;
    rightsObject.upload      = result[0].upload_files;
    rightsObject.comment     = result[0].post_comments;
    rightsObject.download    = result[0].download_files;

    return callback(null, rightsObject);
  });
}

/****************************************************************************************************/

storageAppServicesRights.isAuthorizedToUploadFiles = (serviceID, accountID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  storageAppServicesRights.getRightsTowardsService(serviceID, accountID, databaseConnector, (error, rights) =>
  {
    if(error != null) callback(error);

    else
    {
      rights.upload_files == 0 ? callback(null, false) : callback(null, true);
    }
  });
}

/****************************************************************************************************/