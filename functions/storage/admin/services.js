'use strict'

const fs                        = require('fs');
const uuid                      = require('uuid');
const errors                    = require(`${__root}/json/errors`);
const constants                 = require(`${__root}/functions/constants`);
const foldersCreate             = require(`${__root}/functions/folders/create`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesRemove     = require(`${__root}/functions/storage/files/remove`);
const storageAppExtensionsGet   = require(`${__root}/functions/storage/extensions/get`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);
const databaseManager           = require(`${__root}/functions/database/MySQLv3`);

const commonFoldersCreate       = require(`${__root}/functions/common/folders/create`);
const commonFoldersRemove       = require(`${__root}/functions/common/folders/remove`);

/****************************************************************************************************/
/* CREATE SERVICE */
/****************************************************************************************************/

function createService(serviceName, maxFileSize, authorizedExtensions, accountRights, databaseConnection, params, callback)
{
  serviceName = serviceName.toLowerCase();

  if(maxFileSize < params.init.minFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_LOW, detail: null });

  if(maxFileSize > params.init.maxFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_HIGH, detail: null });

  if(authorizedExtensions.length === 0) return callback({ status: 406, code: constants.ONE_EXTENSION_REQUIRED, detail: null });

  if(accountRights.createServices == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_CREATE_SERVICES, detail: null });

  storageAppServicesGet.getServiceUsingName(serviceName, databaseConnection, params, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists) return callback({ status: 406, code: constants.SERVICE_NAME_ALREADY_IN_USE, detail: null });

    const generatedUuidForService = uuid.v4();

    createServiceInDatabase(serviceName, generatedUuidForService, maxFileSize, authorizedExtensions, databaseConnection, params, (error) =>
    {
      return callback(error, generatedUuidForService);
    });
  });
}

/****************************************************************************************************/

function createServiceInDatabase(serviceName, generatedUuidForService, maxFileSize, authorizedExtensions, databaseConnection, params, callback)
{
  databaseManager.insertQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: { uuid: generatedUuidForService, name: serviceName, file_size_limit: maxFileSize }
    
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    createServiceAddExtensions(generatedUuidForService, authorizedExtensions, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function createServiceAddExtensions(serviceUuid, authorizedExtensions, databaseConnection, params, callback)
{
  var extensionsIterator = 0;

  var extensionsBrowser = () =>
  {
    storageAppExtensionsGet.getExtensionFromUuid(authorizedExtensions[extensionsIterator], databaseConnection, params, (error, extensionExists, extensionData) =>
    {
      if(error != null) createServiceRollback(serviceUuid, databaseConnection, params, errors[error.code], callback);

      else if(extensionExists == false) createServiceRollback(serviceUuid, databaseConnection, params, errors[constants.EXTENSION_NOT_FOUND], callback);

      else
      {
        const generatedUuidForExtension = uuid.v4();

        databaseManager.insertQuery(
        {
          databaseName: params.database.storage.label,
          tableName: params.database.storage.tables.serviceExtensions,
          args: { uuid: generatedUuidForExtension, extension_uuid: authorizedExtensions[extensionsIterator], service_uuid: serviceUuid }

        }, databaseConnection, (error) =>
        {
          error != null
          ? createServiceRollback(serviceUuid, databaseConnection, params, errors[constants.SAVING_SERVICE_EXTENSIONS_FAILED], callback)
          : authorizedExtensions[extensionsIterator += 1] != undefined
            ? extensionBrowser()
            : createServiceStorageFolder(serviceUuid, databaseConnection, params, callback);
        });
      }
    });
  }

  extensionsBrowser();
}

/****************************************************************************************************/

function createServiceStorageFolder(serviceUuid, databaseConnection, params, callback)
{
  commonFoldersCreate.createFolder(serviceUuid, `${params.storage.root}/${params.storage.services}`, (error) =>
  {
    if(error == null) return callback(null);

    createServiceRollback(serviceUuid, databaseConnection, params, errors[error.code], callback);
  });
}

/****************************************************************************************************/

function createServiceRollback(serviceUuid, databaseConnection, params, errorDetail, callback)
{
  removeService(serviceUuid, databaseConnection, params, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SERVICE_CREATION_FAILED_WITH_ROLLBACK, detail: error.detail });

    return callback({ status: 500, code: constants.SERVICE_CREATION_FAILED, detail: errorDetail });
  });
}

/****************************************************************************************************/
/* REMOVE SERVICE */
/****************************************************************************************************/

function removeService(serviceUuid, accountRights, databaseConnection, params, callback)
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Global parameters are missing from request parameters' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Service UUID is missing from request parameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Database connection object is missing from request parameters' });

  if(accountRights.removeServices == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_SERVICES, detail: null });

  var serviceRemoveStats = {}
  serviceRemoveStats.serviceRemovedFromDatabase = false;
  serviceRemoveStats.serviceExtensionsRemoved = 0;
  serviceRemoveStats.serviceFilesMovedToBin = 0;
  serviceRemoveStats.serviceFoldersRemoved = 0;
  serviceRemoveStats.serviceRightsRemoved = 0;
  serviceRemoveStats.serviceFolderRemoved = false;
  
  storageAppServicesGet.getFilesFromService(serviceUuid, databaseConnection, params, (error, serviceFiles) =>
  {
    if(error != null) return callback(error, serviceRemoveStats);
  
    removeServiceDirectories(serviceUuid, serviceFiles, databaseConnection, params, serviceRemoveStats, (error) =>
    {
      return callback(error, serviceRemoveStats);
    });
  });
}

/****************************************************************************************************/

function removeServiceDirectories(serviceUuid, serviceFiles, databaseConnection, params, serviceRemoveStats, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceElements,
    where: { condition: 'AND', 0: { operator: '=', key: 'is_directory', value: 1 }, 1: { operator: '=', key: 'service_uuid', value: serviceUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.REMOVE_SERVICE_FAILED, detail: error }, serviceRemoveStats);

    serviceRemoveStats.serviceFoldersRemoved = result.affectedRows;

    removeServiceMoveFilesToBin(serviceUuid, serviceFiles, 0, databaseConnection, params, serviceRemoveStats, callback);
  });
}

/****************************************************************************************************/

function removeServiceMoveFilesToBin(serviceUuid, serviceFiles, filesIterator, databaseConnection, params, serviceRemoveStats, callback)
{
  if(serviceFiles[filesIterator] == undefined) removeServiceDropExtensions(serviceUuid, databaseConnection, params, serviceRemoveStats, callback);

  else
  {
    storageAppFilesRemove.removeFileFromService(serviceFiles[filesIterator].uuid, serviceUuid, databaseConnection, params, (error) =>
    {
      if(error != null) return callback({ status: 500, code: constants.REMOVE_SERVICE_FAILED, detail: error.detail }, serviceRemoveStats);
    
      serviceRemoveStats.serviceFilesMovedToBin += 1;

      removeServiceMoveFilesToBin(serviceUuid, serviceFiles, (filesIterator + 1), databaseConnection, params, serviceRemoveStats, callback);
    });
  }
}

/****************************************************************************************************/

function removeServiceDropExtensions(serviceUuid, databaseConnection, params, serviceRemoveStats, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceExtensions,
    where: { operator: '=', key: 'service_uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.REMOVE_SERVICE_FAILED, detail: error }, serviceRemoveStats);

    serviceRemoveStats.serviceExtensionsRemoved = result.affectedRows;

    removeServiceDropAccountsRights(serviceUuid, databaseConnection, params, serviceRemoveStats, callback);
  });
}

/****************************************************************************************************/

function removeServiceDropAccountsRights(serviceUuid, databaseConnection, params, serviceRemoveStats, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.accountServiceLevel,
    where: { operator: '=', key: 'service_uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.REMOVE_SERVICE_FAILED, detail: error }, serviceRemoveStats);

    serviceRemoveStats.serviceRightsRemoved = result.affectedRows;

    removeServiceFromDatabase(serviceUuid, databaseConnection, params, serviceRemoveStats, callback);
  });
}

/****************************************************************************************************/

function removeServiceFromDatabase(serviceUuid, databaseConnection, params, serviceRemoveStats, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.REMOVE_SERVICE_FAILED, detail: error }, serviceRemoveStats);

    serviceRemoveStats.serviceRemovedFromDatabase = true;

    removeServiceFolder(serviceUuid, params, serviceRemoveStats, callback);
  });
}

/****************************************************************************************************/

function removeServiceFolder(serviceUuid, params, serviceRemoveStats, callback)
{
  commonFoldersRemove.removeFolder(`${params.storage.root}/${params.storage.services}/${serviceUuid}`, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.REMOVE_SERVICE_FAILED, detail: error.detail }, serviceRemoveStats);
  
    serviceRemoveStats.serviceFolderRemoved = true;

    return callback(null, serviceRemoveStats)
  });
}

/****************************************************************************************************/
/* UPDATE SERVICE */
/****************************************************************************************************/

function updateService(serviceUuid, serviceName, maxFileSize, authorizedExtensions, accountRights, databaseConnection, params, callback)
{
  serviceName = serviceName.toLowerCase();

  if(maxFileSize < params.init.minFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_LOW, detail: null });

  if(maxFileSize > params.init.maxFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_HIGH, detail: null });

  if(authorizedExtensions.length === 0) return callback({ status: 406, code: constants.ONE_EXTENSION_REQUIRED, detail: null });

  if(accountRights.modifyServices == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_MODIFY_SERVICES, detail: null });

  storageAppServicesGet.getServiceUsingName(serviceName, databaseConnection, params, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists && serviceUuid !== serviceData.uuid) return callback({ status: 406, code: constants.SERVICE_NAME_ALREADY_IN_USE, detail: null });

    updateServiceRemoveCurrentExtensions(serviceUuid, serviceName, maxFileSize, authorizedExtensions, databaseConnection, params, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/

function updateServiceRemoveCurrentExtensions(serviceUuid, serviceName, maxFileSize, authorizedExtensions, databaseConnection, params, callback)
{
  storageAppExtensionsGet.getExtensionsForService(serviceUuid, databaseConnection, params, (error, currentServiceExtensions) =>
  {
    if(error != null) return callback({ status: 500, code: constants.UPDATING_SERVICE_EXTENSIONS_IN_DATABASE_FAILED, detail: error.detail });

    databaseManager.deleteQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.serviceExtensions,
      where: { operator: '=', key: 'service_uuid', value: serviceUuid }

    }, databaseConnection, (error) =>
    {
      if(error != null) return callback({ status: 500, code: constants.UPDATING_SERVICE_EXTENSIONS_IN_DATABASE_FAILED, detail: error });

      updateServiceInsertNewExtensions(serviceUuid, serviceName, maxFileSize, authorizedExtensions, currentServiceExtensions, databaseConnection, params, callback);
    });
  });
}

/****************************************************************************************************/

function updateServiceInsertNewExtensions(serviceUuid, serviceName, maxFileSize, authorizedExtensions, currentServiceExtensions, databaseConnection, params, callback)
{
  var extensionsIterator = 0;

  var extensionsBrowser = () =>
  {
    storageAppExtensionsGet.getExtensionFromUuid(authorizedExtensions[extensionsIterator], databaseConnection, params, (error, extensionExists, extensionData) =>
    {
      if(error != null) updateServiceRollback(serviceUuid, currentServiceExtensions, databaseConnection, params, errors[constants.UPDATING_SERVICE_EXTENSIONS_FAILED], callback);

      else if(extensionExists == false) updateServiceRollback(serviceUuid, currentServiceExtensions, databaseConnection, params, errors[constants.UPDATING_SERVICE_EXTENSIONS_FAILED], callback);

      const generatedUuidForExtension = uuid.v4();

      databaseManager.insertQuery(
      {
        databaseName: params.database.storage.label,
        tableName: params.database.storage.tables.serviceExtensions,
        args: { uuid: generatedUuidForExtension, extension_uuid: authorizedExtensions[extensionsIterator], service_uuid: serviceUuid }

      }, databaseConnection, (error) =>
      {
        if(error != null) updateServiceRollback(serviceUuid, currentServiceExtensions, databaseConnection, params, errors[constants.UPDATING_SERVICE_EXTENSIONS_FAILED], callback);

        authorizedExtensions[extensionsIterator += 1] == undefined
        ? updateServiceInDatabase(serviceUuid, serviceName, maxFileSize, currentServiceExtensions, databaseConnection, params, callback)
        : extensionBrowser();
      });
    });
  }

  extensionsBrowser();
}

/****************************************************************************************************/

function updateServiceInDatabase(serviceUuid, serviceName, maxFileSize, currentServiceExtensions, databaseConnection, params, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: { name: serviceName, file_size_limit: maxFileSize },
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error) =>
  {
    if(error == null) return callback(null);

    updateServiceRollback(serviceUuid, currentServiceExtensions, databaseConnection, params, errors[constants.UPDATING_SERVICE_DATA_FAILED], callback);
  });
}

/****************************************************************************************************/

function updateServiceRollback(serviceUuid, currentServiceExtensions, databaseConnection, params, errorDetail, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceExtensions,
    where: { operator: '=', key: 'service_uuid', value: serviceUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SERVICE_UPDATE_EXTENSIONS_ROLLBACK_FAILED, detail: errorDetail });

    var extensionsIterator = 0;

    var extensionBrowser = () =>
    {
      const generatedUuidForExtension = uuid.v4();

      databaseManager.insertQuery(
      {
        databaseName: params.database.storage.label,
        tableName: params.database.storage.tables.serviceExtensions,
        args: { uuid: generatedUuidForExtension, extension_uuid: currentServiceExtensions[extensionsIterator], service_uuid: serviceUuid }

      }, databaseConnection, (error) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SERVICE_UPDATE_EXTENSIONS_ROLLBACK_FAILED, detail: errorDetail });

        if(currentServiceExtensions[extensionsIterator += 1] == undefined) return callback({ status: 500, code: constants.UPDATING_SERVICE_IN_DATABASE_FAILED, detail: errorDetail });
        
        extensionBrowser();
      });
    }

    extensionBrowser();
  });
}

/****************************************************************************************************/
/****************************************************************************************************/

module.exports =
{
  createService: createService,
  removeService: removeService,
  updateService: updateService
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
// FUNCTION USED ON SERVICE CREATION
/****************************************************************************************************/

function createStorageFolder(serviceUuid, params, callback)
{
  foldersCreate.createFolder(serviceUuid, `${params.storage.root}/${params.storage.services}`, (error) =>
  {
    if(error == null) return callback(null);

    return callback(error);
  });
}

/****************************************************************************************************/

function createLogsFolder(serviceUuid, params, callback)
{
  foldersCreate.createFolder(serviceUuid, `${params.storage.root}/${params.storage.fileLogs}`, (error) =>
  {
    if(error == null) return callback(null);

    return callback(error);
  });
}

/****************************************************************************************************/