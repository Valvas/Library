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

    rightsObject.service          = result[0].service == 1;
    rightsObject.removeFiles      = result[0].remove_files == 1;
    rightsObject.uploadFiles      = result[0].upload_files == 1;
    rightsObject.commentFiles     = result[0].post_comments == 1;
    rightsObject.downloadFiles    = result[0].download_files == 1;
    rightsObject.createFolders    = result[0].create_folders == 1;
    rightsObject.renameFolders    = result[0].rename_folders == 1;
    rightsObject.removeFolders    = result[0].remove_folders == 1;
    rightsObject.restoreFiles     = result[0].restore_files == 1;

    return callback(null, rightsObject);
  });
}

/****************************************************************************************************/

storageAppServicesRights.checkIfAccountHasRightsOnService = (accountId, serviceUuid, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountId == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.rights,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountId }, 1: { operator: '=', key: 'service', value: serviceUuid } }
    
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error.message });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
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