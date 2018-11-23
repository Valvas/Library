'use strict'

const constants                           = require(`${__root}/functions/constants`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);
const storageAppLogsServicesDownloadFile  = require(`${__root}/functions/storage/logs/services/downloadFile`);

/****************************************************************************************************/

module.exports.downloadFile = (fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, params, callback) =>
{
  if(fileUuid == undefined || serviceUuid == undefined || accountUuid == undefined || isGlobalAdmin == undefined || databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  checkIfServiceExists(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, params, (error, filePath, fileName) =>
  {
    return callback(error, filePath, fileName);
  });
}

/****************************************************************************************************/

function checkIfServiceExists(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, params, callback)
{
  storageAppServicesGet.checkIfServiceExistsFromUuid(serviceUuid, databaseConnection, params, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    checkUserRightsTowardsCurrentService(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkUserRightsTowardsCurrentService(fileUuid, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, params, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, params, (error, serviceRights) =>
  {
    if(error != null) return callback(error);

    if(serviceRights.downloadFiles == false && serviceRights.isAdmin == false && isGlobalAdmin == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_DOWNLOAD_FILES, detail: null });

    getFileFromDatabase(fileUuid, serviceUuid, accountUuid, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getFileFromDatabase(fileUuid, serviceUuid, accountUuid, databaseConnection, params, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: 'database' });

    if(fileData.is_deleted === 1) return callback({ status: 404, code: constants.FILE_HAS_BEEN_DELETED, detail: null });

    getFileFromStorage(fileData, serviceUuid, accountUuid, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getFileFromStorage(fileData, serviceUuid, accountUuid, databaseConnection, params, callback)
{
  storageAppFilesGet.checkIfFileExistsOnStorage(fileData.uuid, serviceUuid, params, (error, fileExists, fileStats) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: 'storage' });

    storageAppLogsServicesDownloadFile.addDownloadFileLog(accountUuid, fileData.uuid, databaseConnection, params, (error) => {  });

    return callback(null, `${params.storage.root}/${params.storage.services}/${serviceUuid}/${fileData.uuid}`, fileData.name);
  });
}

/****************************************************************************************************/