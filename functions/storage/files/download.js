'use strict'

const constants                           = require(`${__root}/functions/constants`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppAdminGet                  = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppLogsServices              = require(`${__root}/functions/storage/logs/services`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);

/****************************************************************************************************/

module.exports.downloadFile = (fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, callback) =>
{
  if(fileUuid == undefined || serviceUuid == undefined || accountUuid == undefined || isGlobalAdmin == undefined || databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  checkIfServiceExists(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, (error, filePath, fileName, isAppAdmin, accountRightsOnService) =>
  {
    return callback(error, filePath, fileName, isAppAdmin, accountRightsOnService);
  });
}

/****************************************************************************************************/

function checkIfServiceExists(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, callback)
{
  storageAppServicesGet.checkIfServiceExistsFromUuid(serviceUuid, databaseConnection, globalParameters, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    return checkIfAccountIsAppAdmin(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function checkIfAccountIsAppAdmin(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, (error, isAppAdmin) =>
  {
    if(error != null) return callback(error);

    if(isAppAdmin || isGlobalAdmin) return getFileFromDatabase(fileUuid, serviceUuid, accountUuid, isAppAdmin, null, databaseConnection, globalParameters, callback);

    return checkUserRightsTowardsCurrentService(fileUuid, serviceUuid, accountUuid, isAppAdmin, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function checkUserRightsTowardsCurrentService(fileUuid, serviceUuid, accountUuid, isAppAdmin, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(accountRightsOnService.downloadFiles == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_DOWNLOAD_FILES, detail: null });

    return getFileFromDatabase(fileUuid, serviceUuid, accountUuid, isAppAdmin, accountRightsOnService, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function getFileFromDatabase(fileUuid, serviceUuid, accountUuid, isAppAdmin, accountRightsOnService, databaseConnection, globalParameters, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, globalParameters, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE, detail: 'database' });

    if(fileData.is_deleted === 1) return callback({ status: 404, code: constants.FILE_HAS_BEEN_DELETED, detail: null });

    return getFileFromStorage(fileData, serviceUuid, accountUuid, isAppAdmin, accountRightsOnService, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function getFileFromStorage(fileData, serviceUuid, accountUuid, isAppAdmin, accountRightsOnService, databaseConnection, globalParameters, callback)
{
  storageAppFilesGet.checkIfFileExistsOnStorage(fileData.uuid, serviceUuid, globalParameters, (error, fileExists, fileStats) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND_ON_DISK, detail: 'storage' });

    storageAppLogsServices.addDownloadFileLog(accountUuid, fileData.uuid, databaseConnection, globalParameters, (error) => {  });

    return callback(null, `${globalParameters.storage.root}/${globalParameters.storage.services}/${serviceUuid}/${fileData.uuid}`, fileData.name, isAppAdmin, accountRightsOnService);
  });
}

/****************************************************************************************************/