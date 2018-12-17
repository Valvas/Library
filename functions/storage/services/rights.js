'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const storageAppAccessGet = require(`${__root}/functions/storage/access/get`);

/****************************************************************************************************/

function getRightsTowardsAllServices(accountUuid, databaseConnection, params, callback)
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.accountServiceLevel,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

  }, databaseConnection, (error, rights) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var x = 0;

    var rightsObject = {};

    for(var x = 0; x < rights.length; x++)
    {
      rightsObject[rights[x].service_uuid] = rights[x].level;
    }

    return callback(null, rightsObject);
  });
}

/****************************************************************************************************/

function getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, params, callback)
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceRights,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'account_uuid', value: accountUuid }, 1: { operator: '=', key: 'service_uuid', value: serviceUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var serviceRights = {};

    serviceRights.isAdmin                   = result.length > 0 ? result[0].is_admin : 0;
    serviceRights.accessService             = result.length > 0 ? result[0].access_service : 0;
    serviceRights.postComments              = result.length > 0 ? result[0].post_comments : 0;
    serviceRights.uploadFiles               = result.length > 0 ? result[0].upload_files : 0;
    serviceRights.createFolders             = result.length > 0 ? result[0].create_folders : 0;
    serviceRights.downloadFiles             = result.length > 0 ? result[0].download_files : 0;
    serviceRights.moveFiles                 = result.length > 0 ? result[0].move_files : 0;
    serviceRights.renameFolders             = result.length > 0 ? result[0].rename_folders : 0;
    serviceRights.removeFolders             = result.length > 0 ? result[0].remove_folders : 0;
    serviceRights.restoreFiles              = result.length > 0 ? result[0].restore_files : 0;
    serviceRights.removeFiles               = result.length > 0 ? result[0].remove_files : 0;
    serviceRights.editOwnCommentsOnFile     = result.length > 0 ? result[0].edit_own_comments_on_files : 0;
    serviceRights.editAllCommentsOnFile     = result.length > 0 ? result[0].edit_all_comments_on_files : 0;
    serviceRights.removeOwnCommentsOnFile   = result.length > 0 ? result[0].remove_own_comments_on_files : 0;
    serviceRights.removeAllCommentsOnFile   = result.length > 0 ? result[0].remove_all_comments_on_files : 0;

    if(result.length > 0) return callback(null, serviceRights);

    databaseManager.insertQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.serviceRights,
      args: { is_admin: 0, service_uuid: serviceUuid, account_uuid: accountUuid, access_service : 0, post_comments : 0, upload_files : 0, create_folders : 0, download_files : 0, move_files : 0, rename_folders : 0, remove_folders : 0, restore_files : 0, remove_files : 0, edit_own_comments_on_files: 0, edit_all_comments_on_files: 0, remove_own_comments_on_files: 0, remove_all_comments_on_files: 0 }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null, serviceRights);
    });
  });
}

/****************************************************************************************************/

/** Rights on a service are managed by levels. Each level gives defined rights on the service. An acco
  * unt must have a right level defined for all services. The default level is 0, it gives no rights o
  * n the service. This function is designed to check if an account has a right level defined for all
  * services and must create an entry in the database if not.
*/

function checkAccountRightsOnAllServices(accountUuid, databaseConnection, params, callback)
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var index = 0;

    var servicesBrowser = () =>
    {
      getRightsTowardsService(result[index].uuid, accountUuid, databaseConnection, params, (error) =>
      {
        if(error != null) return callback(error);

        if(result[index += 1] == undefined) return callback(null);

        servicesBrowser();
      });
    }

    if(result.length === 0) return callback(null);

    servicesBrowser();
  });
}

/*****************************************************************************************************/

/** Rights on a service are managed by levels. Each level gives defined rights on the service. An acco
  * unt must have a right level defined for all services. The default level is 0, it gives no rights o
  * n the service. This function is designed to check if all the accounts that have access to the appl
  * ication have rights on the provided service.
*/

function checkAccountsRightsForProvidedService(serviceUuid, databaseConnection, params, callback)
{
  storageAppAccessGet.getAccountsThatHaveAccessToTheApp(databaseConnection, params, (error, accounts) =>
  {
    if(error != null) return callback(error);

    if(accounts.length === 0) return callback(null);

    var index = 0;

    var accountsBrowser = () =>
    {
      getRightsTowardsService(serviceUuid, accounts[index], databaseConnection, params, (error) =>
      {
        if(error != null) return callback(error);

        if(accounts[index += 1] == undefined) return callback(null);

        accountsBrowser();
      });
    }

    accountsBrowser();
  });
}

/****************************************************************************************************/

function updateAccountRightsOnService(accountUuid, serviceUuid, rights, databaseConnection, globalParameters, callback)
{
  if(rights == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rights' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceRights,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'account_uuid', value: accountUuid }, 1: { operator: '=', key: 'service_uuid', value: serviceUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0)
    {
      databaseManager.insertQuery(
      {
        databaseName: globalParameters.database.storage.label,
        tableName: globalParameters.database.storage.tables.serviceRights,
        args: { service_uuid: serviceUuid, account_uuid: accountUuid, is_admin: rights.isAdmin, access_service: rights.accessService, post_comments: rights.postComments, upload_files: rights.uploadFiles, create_folders: rights.createFolders, download_files: rights.downloadFiles, move_files: rights.moveFiles, rename_folders: rights.renameFolders, remove_folders: rights.removeFolders, restore_files: rights.restoreFiles, remove_files: rights.removeFiles, edit_own_comments_on_files: rights.editOwnCommentsOnFile, edit_all_comments_on_files: rights.editAllCommentsOnFile, remove_own_comments_on_files: rights.removeOwnCommentsOnFile, remove_all_comments_on_files: rights.removeAllCommentsOnFile }
      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        return callback(null);
      });
    }

    else
    {
      databaseManager.updateQuery(
      {
        databaseName: globalParameters.database.storage.label,
        tableName: globalParameters.database.storage.tables.serviceRights,
        args: { is_admin: rights.isAdmin, access_service: rights.accessService, post_comments: rights.postComments, upload_files: rights.uploadFiles, create_folders: rights.createFolders, download_files: rights.downloadFiles, move_files: rights.moveFiles, rename_folders: rights.renameFolders, remove_folders: rights.removeFolders, restore_files: rights.restoreFiles, remove_files: rights.removeFiles, edit_own_comments_on_files: rights.editOwnCommentsOnFile, edit_all_comments_on_files: rights.editAllCommentsOnFile, remove_own_comments_on_files: rights.removeOwnCommentsOnFile, remove_all_comments_on_files: rights.removeAllCommentsOnFile },
        where: { condition: 'AND', 0: { operator: '=', key: 'account_uuid', value: accountUuid }, 1: { operator: '=', key: 'service_uuid', value: serviceUuid } }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        return callback(null);
      });
    }
  });
}

/****************************************************************************************************/

module.exports =
{
  getRightsTowardsService: getRightsTowardsService,
  getRightsTowardsAllServices: getRightsTowardsAllServices,
  updateAccountRightsOnService: updateAccountRightsOnService,
  checkAccountRightsOnAllServices: checkAccountRightsOnAllServices,
  checkAccountsRightsForProvidedService: checkAccountsRightsForProvidedService
}

