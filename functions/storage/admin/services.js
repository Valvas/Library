'use strict'

const fs                        = require('fs');
const constants                 = require(`${__root}/functions/constants`);
const accountsGet               = require(`${__root}/functions/accounts/get`);
const foldersCreate             = require(`${__root}/functions/folders/create`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesRemove     = require(`${__root}/functions/storage/files/remove`);
const errorReportsCreate        = require(`${__root}/functions/common/errors/create`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const oldDatabaseManager    = require(`${__root}/functions/database/MySQLv2`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.createService = (serviceName, maxFileSize, authorizedExtensions, accountID, databaseConnector, params, callback) =>
{
  serviceName = serviceName.toLowerCase();

  if(maxFileSize < params.init.minFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_LOW, detail: null });

  if(maxFileSize > params.init.maxFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_HIGH, detail: null });

  if(Object.keys(authorizedExtensions).length == 0) return callback({ status: 406, code: constants.ONE_EXTENSION_REQUIRED, detail: null });

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    if(error != null) return callback(error);

    storageAppAdminGet.getAccountAdminRights(accountID, databaseConnector, (error, rights) =>
    {
      if(error != null) return callback(error);

      if(rights.create_services == 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_CREATE_SERVICES });

      storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
      {
        if(error != null && error.status != 404) return callback(error);

        if(error == null) return callback({ status: 406, code: constants.SERVICE_NAME_ALREADY_IN_USE, detail: null });

        databaseManager.insertQueryWithUUID(
        {
          databaseName: params.database.storage.label,
          tableName: params.database.storage.tables.services,
          args: { name: serviceName, file_size_limit: maxFileSize }
          
        }, databaseConnector, (error, result) =>
        {
          if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

          databaseManager.selectQuery(
          {
            databaseName: params.database.storage.label,
            tableName: params.database.storage.tables.services,
            args: [ 'uuid' ],
            where: { operator: '=', key: 'name', value: serviceName }

          }, databaseConnector, (error, service) =>
          {
            if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

            var extensionsIterator = 0;

            var extensionsBrowser = () =>
            {
              databaseManager.selectQuery(
              {
                databaseName: params.database.storage.label,
                tableName: params.database.storage.tables.extensions,
                args: [ 'uuid' ],
                where: { operator: '=', key: 'uuid', value: authorizedExtensions[Object.keys(authorizedExtensions)[extensionsIterator]] }

              }, databaseConnector, (error, extension) =>
              {
                if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

                databaseManager.insertQueryWithUUID(
                {
                  databaseName: params.database.storage.label,
                  tableName: params.database.storage.tables.extensionsForService,
                  args: { extension_uuid: extension[0].uuid, service_uuid: service[0].uuid }

                }, databaseConnector, (error, result) =>
                {
                  if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

                  if(Object.keys(authorizedExtensions)[extensionsIterator += 1] != undefined) extensionsBrowser();

                  else
                  {
                    createStorageFolder(service[0].uuid, databaseConnector, params, (error) =>
                    {
                      if(error != null) return callback(error);

                      createLogsFolder(service[0].uuid, databaseConnector, params, (error) =>
                      {
                        if(error != null) return callback(error);

                        return callback(null);
                      });
                    });
                  }
                });
              });
            }

            extensionsBrowser();
          });
        });
      });
    });
  });
}

/****************************************************************************************************/
// ADD ACCOUNTS IN SERVICE FROM AN ARRRAY OF UUIDs
/****************************************************************************************************/

module.exports.addMembersToService = (serviceUuid, accountUuids, accountId, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 404, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountId == undefined) return callback({ status: 404, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(serviceUuid == undefined) return callback({ status: 404, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(accountUuids == undefined) return callback({ status: 404, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuids' });
  if(databaseConnection == undefined) return callback({ status: 404, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(typeof(accountUuids) !== 'object' || accountUuids.length == 0) return callback(null);

  getAccountData(serviceUuid, accountUuids, accountId, databaseConnection, params, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function getAccountData(serviceUuid, accountUuids, accountId, databaseConnection, params, callback)
{
  commonAccountsGet.checkIfAccountExistsFromId(accountId, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    checkAccountRights(serviceUuid, accountUuids, accountData, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkAccountRights(serviceUuid, accountUuids, accountData, databaseConnection, params, callback)
{
  storageAppAdminGet.getAccountAdminRights(accountData.id, databaseConnection, params, (error, rights) =>
  {
    if(error != null) return callback(error);

    if(rights.update_services_rights === 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_MANAGE_USER_RIGHTS, detail: null });

    getServiceData(serviceUuid, accountUuids, accountData, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getServiceData(serviceUuid, accountUuids, accountData, databaseConnection, params, callback)
{
  storageAppServicesGet.checkIfServiceExists(serviceUuid, databaseConnection, params, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    browseAccountsToAddToService(serviceUuid, accountUuids, accountData, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function browseAccountsToAddToService(serviceUuid, accountUuids, accountData, databaseConnection, params, callback)
{
  var index = 0;

  var accountBrowser = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(accountUuids[index], databaseConnection, params, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

      storageAppServicesRights.checkIfAccountHasRightsOnService(accountData.id, serviceUuid, databaseConnection, params, (error, hasRights, accountRights) =>
      {
        if(error != null) return callback(error);

        if(hasRights)
        {
          if(accountUuids[index += 1] == undefined) return callback(null);

          accountBrowser();
        }

        else
        {
          databaseManager.insertQuery(
          {
            databaseName: params.database.storage.label,
            tableName: params.database.storage.tables.rights,
            args: { account: accountData.id, service: serviceUuid, upload_files: 0, download_files: 0, remove_files: 0, post_comments: 0, restore_files: 0, create_folders: 0, rename_folders: 0, remove_folders: 0 }

          }, databaseConnection, (error, result) =>
          {
            if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

            if(accountUuids[index += 1] == undefined) return callback(null);

            accountBrowser();
          });
        }
      });
    });
  }

  accountBrowser();
}

/****************************************************************************************************/
// REMOVE MEMBERS FROM A SERVICE USING AN ARRAY OF UUIDs
/****************************************************************************************************/

module.exports.removeMembersFromService = (serviceUuid, accountUuids, accountId, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountId == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(accountUuids == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuids' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  commonAccountsGet.checkIfAccountExistsFromId(accountId, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    storageAppAdminGet.getAccountAdminRights(accountId, databaseConnection, params, (error, rights) =>
    {
      if(error != null) return callback(error);

      if(rights.update_services_rights === 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_MANAGE_USER_RIGHTS, detail: null });

      browseAccountsToRemoveFromService(serviceUuid, accountUuids, databaseConnection, params, (error) =>
      {
        return callback(error);
      });
    });
  });
}

/****************************************************************************************************/

function browseAccountsToRemoveFromService(serviceUuid, accountUuids, databaseConnection, params, callback)
{
  var index = 0;

  var browseAccounts = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(accountUuids[index], databaseConnection, params, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

      databaseManager.deleteQuery(
      {
        databaseName: params.database.storage.label,
        tableName: params.database.storage.tables.rights,
        where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountData.id }, 1: { operator: '=', key: 'service', value: serviceUuid } }
  
      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: Constants.SQL_SERVER_ERROR, detail: error });

        if(accountUuids[index += 1] == undefined) return callback(null);

        browseAccounts();
      });
    });
  }

  if(accountUuids.length === 0) return callback(null);

  browseAccounts();
}

/****************************************************************************************************/
// UPDATE ACCOUNT RIGHTS ON SERVICE
/****************************************************************************************************/

module.exports.updateRightsOnService = (serviceUuid, accountUuid, accountId, rightsObject, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountId == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(accountUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(rightsObject == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });
  if(rightsObject.uploadFiles == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.uploadFiles' });
  if(rightsObject.removeFiles == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.removeFiles' });
  if(rightsObject.commentFiles == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.commentFiles' });
  if(rightsObject.restoreFiles == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.restoreFiles' });
  if(rightsObject.createFolders == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.createFolders' });
  if(rightsObject.renameFolders == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.renameFolders' });
  if(rightsObject.removeFolders == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.removeFolders' });
  if(rightsObject.downloadFiles == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'rightsObject.downloadFiles' });

  storageAppServicesGet.checkIfServiceExists(serviceUuid, databaseConnection, params, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 406, code: constants.SERVICE_NOT_FOUND, detail: null });

    checkRequestSenderRights(serviceUuid, accountUuid, accountId, rightsObject, databaseConnection, params, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/

function checkRequestSenderRights(serviceUuid, accountUuid, accountId, rightsObject, databaseConnection, params, callback)
{
  commonAccountsGet.checkIfAccountExistsFromId(accountId, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    storageAppAdminGet.getAccountAdminRights(accountId, databaseConnection, params, (error, rights) =>
    {
      if(error != null) return callback(error);

      if(rights.update_services_rights === 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_MANAGE_USER_RIGHTS, detail: null });

      updateAccountRights(serviceUuid, accountUuid, rightsObject, databaseConnection, params, callback);
    });
  });
}

/****************************************************************************************************/

function updateAccountRights(serviceUuid, accountUuid, rightsObject, databaseConnection, params, callback)
{
  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    databaseManager.updateQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.rights,
      args: { upload_files: rightsObject.uploadFiles == true ? 1 : 0, download_files: rightsObject.downloadFiles == true ? 1 : 0, remove_files: rightsObject.removeFiles == true ? 1 : 0, post_comments: rightsObject.commentFiles == true ? 1 : 0, restore_files: rightsObject.restoreFiles == true ? 1 : 0, create_folders: rightsObject.createFolders == true ? 1 : 0, rename_folders: rightsObject.renameFolders == true ? 1 : 0, remove_folders: rightsObject.removeFolders == true ? 1 : 0 },
      where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountData.id }, 1: { operator: '=', key: 'service', value: serviceUuid } }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/
// FUNCTION USED ON SERVICE CREATION
/****************************************************************************************************/

function createStorageFolder(serviceUUID, databaseConnector, params, callback)
{
  foldersCreate.createFolder(serviceUUID, `${params.storage.root}/${params.storage.services}`, (error) =>
  {
    if(error == null) return callback(null);

    console.log('MUST DELETE SERVICE + EXTENSIONS AUTHORIZED');

    return callback(error);
  });
}

/****************************************************************************************************/

function createLogsFolder(serviceUUID, databaseConnector, params, callback)
{
  foldersCreate.createFolder(serviceUUID, `${params.storage.root}/${params.storage.fileLogs}`, (error) =>
  {
    if(error == null) return callback(null);

    console.log('MUST DELETE SERVICE + EXTENSIONS AUTHORIZED');

    return callback(error);
  });
}

/****************************************************************************************************/

module.exports.removeService = (serviceUUID, accountID, databaseConnection, params, callback) =>
{
    storageAppServicesGet.getServiceUsingUUID(serviceUUID, databaseConnection, (error, service) =>
    {
      if(error != null) return callback(error);

      storageAppAdminGet.getAccountAdminRights(accountID, databaseConnection, (error, rights) =>
      {
        if(error != null) return callback(error);

        if(rights.remove_services == 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_SERVICES, detail: null });

        removeFilesFromService(service, accountID, databaseConnection, params, (error) => {});
        removeFoldersFromService(service, databaseConnection, params, (error) => {});

        databaseManager.deleteQuery(
        {
          databaseName: params.database.storage.label,
          tableName: params.database.storage.tables.extensionsForService,
          where: { operator: '=', key: 'service_uuid', value: serviceUUID }

        }, databaseConnection, (error, result) =>
        {
          if(error) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

          databaseManager.deleteQuery(
          {
            databaseName: params.database.storage.label,
            tableName: params.database.storage.tables.services,
            where: { operator: '=', key: 'uuid', value: serviceUUID }
  
          }, databaseConnection, (error, result) =>
          {
            if(error) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

            fs.rmdir(`${params.storage.root}/${params.storage.services}/${serviceUUID}`, (error) =>
            {
              return callback(null);
            });
          });
        });
      });
    });
}

/****************************************************************************************************/

function removeFilesFromService(service, accountID, databaseConnector, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.files,
    args: [ '*' ],
    where: { operator: '=', key: 'service', value: service.id }

  }, databaseConnector, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var x = 0;

    if(result[x] == undefined) return callback(null);

    var filesToRemove = [];

    var browseFilesLoop = () =>
    {
      filesToRemove.push(`${result[x].name}.${result[x].ext}`);

      if(result[x += 1] != undefined) browseFilesLoop();

      else
      {
        storageAppFilesRemove.removeFiles(filesToRemove, service, accountID, databaseConnector, (error) =>
        {
          return callback(error);
        });
      }
    }

    browseFilesLoop();
  });
}

/****************************************************************************************************/

module.exports.updateServiceName = (serviceUuid, newServiceName, databaseConnection, params, callback) =>
{
  if(new RegExp('^[a-zA-Zàéèäëïöüâêîôû][a-zA-Zàéèäëïöüâêîôû0-9]*(( )?[a-zA-Zàéèäëïöüâêîôû0-9]+)*$').test(newServiceName) == false)
  {
    return callback({ status: 406, code: constants.WRONG_SERVICE_LABEL_FORMAT, detail: null });
  }

  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: { 'name': newServiceName },
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports.updateServiceMaxFileSize = (serviceUuid, serviceMaxFileSize, databaseConnection, params, callback) =>
{
  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: { 'file_size_limit': serviceMaxFileSize },
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

function removeFoldersFromService(service, databaseConnection, params, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    where:
    {
      operator: '=',
      key: 'service',
      value: service.id
    }
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

    return callback(null);
  });
}

/****************************************************************************************************/