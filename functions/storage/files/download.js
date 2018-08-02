'use strict'

const constants                           = require(`${__root}/functions/constants`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);
const storageAppLogsServicesDownloadFile  = require(`${__root}/functions/storage/logs/services/downloadFile`);

/****************************************************************************************************/

module.exports.downloadFile = (fileUuid, serviceUuid, accountId, databaseConnection, params, callback) =>
{
  if(fileUuid == undefined || serviceUuid == undefined || accountId == undefined || databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  checkIfServiceExists(fileUuid, serviceUuid, accountId, databaseConnection, params, (error, filePath) =>
  {
    return callback(error, filePath);
  });
}

/****************************************************************************************************/

function checkIfServiceExists(fileUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  storageAppServicesGet.getServiceUsingUUID(serviceUuid, databaseConnection, (error, serviceData) =>
  {
    if(error != null) return callback(error);

    checkUserRightsTowardsCurrentService(fileUuid, serviceUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkUserRightsTowardsCurrentService(fileUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountId, databaseConnection, params, (error, accountRights) =>
  {
    if(error != null) return callback(error);

    if(accountRights.download_files === 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_DOWNLOAD_FILES, detail: null });

    getFileFromDatabase(fileUuid, serviceUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getFileFromDatabase(fileUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: 'database' });

    if(fileData.deleted === 1) return callback({ status: 404, code: constants.FILE_HAS_BEEN_DELETED, detail: null });

    getFileFromStorage(fileData, serviceUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getFileFromStorage(fileData, serviceUuid, accountId, databaseConnection, params, callback)
{
  storageAppFilesGet.checkIfFileExistsOnStorage(fileData.uuid, fileData.ext, serviceUuid, params, (error, fileExists, fileStats) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: 'storage' });

    storageAppLogsServicesDownloadFile.addDownloadFileLog(params.fileLogs.download, accountId, fileData.uuid, serviceUuid, databaseConnection, params, (error) => {  });

    return callback(null, `${params.storage.root}/${params.storage.services}/${serviceUuid}/${fileData.uuid}.${fileData.ext}`);
  });
}

/****************************************************************************************************/