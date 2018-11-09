'use strict'

const uuid                      = require('uuid');
const errors                    = require(`${__root}/json/errors`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);
const storageAppFilesRemove     = require(`${__root}/functions/storage/files/remove`);
const storageAppExtensionsGet   = require(`${__root}/functions/storage/extensions/get`);
const databaseManager           = require(`${__root}/functions/database/MySQLv3`);

const commonFoldersCreate       = require(`${__root}/functions/common/folders/create`);
const commonFoldersRemove       = require(`${__root}/functions/common/folders/remove`);

/****************************************************************************************************/
/* CREATE SERVICE */
/****************************************************************************************************/

function createService(serviceName, maxFileSize, authorizedExtensions, databaseConnection, params, callback)
{
  serviceName = serviceName.toLowerCase();

  if(maxFileSize < params.init.minFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_LOW, detail: null });

  if(maxFileSize > params.init.maxFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_HIGH, detail: null });

  if(authorizedExtensions.length === 0) return callback({ status: 406, code: constants.ONE_EXTENSION_REQUIRED, detail: null });

  storageAppServicesGet.checkIfServiceExistsFromName(serviceName, databaseConnection, params, (error, serviceExists, serviceData) =>
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
            ? extensionsBrowser()
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

function removeService(serviceUuid, databaseConnection, params, callback)
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Global parameters are missing from request parameters' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Service UUID is missing from request parameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Database connection object is missing from request parameters' });

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
    tableName: params.database.storage.tables.accountServiceRightsLevel,
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

function updateService(serviceUuid, serviceName, maxFileSize, authorizedExtensions, databaseConnection, params, callback)
{
  serviceName = serviceName.toLowerCase();

  if(maxFileSize < params.init.minFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_LOW, detail: null });

  if(maxFileSize > params.init.maxFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_HIGH, detail: null });

  if(authorizedExtensions.length === 0) return callback({ status: 406, code: constants.ONE_EXTENSION_REQUIRED, detail: null });

  storageAppServicesGet.checkIfServiceExistsFromName(serviceName, databaseConnection, params, (error, serviceExists, serviceData) =>
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
        : extensionsBrowser();
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