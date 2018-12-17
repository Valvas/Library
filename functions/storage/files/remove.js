'use strict'

const fs                                  = require('fs');
const constants                           = require(`${__root}/functions/constants`);
const databaseManager                     = require(`${__root}/functions/database/MySQLv3`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const commonFilesMove                     = require(`${__root}/functions/common/files/move`);
const storageAppAdminGet                  = require(`${__root}/functions/storage/admin/get`);
const storageAppLogsServices              = require(`${__root}/functions/storage/logs/services`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);

/****************************************************************************************************/
// REMOVE FILE
/****************************************************************************************************/

function removeFilesFromService(filesArray, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  removeFilesFromServiceCheckIfAccountIsAppAdmin(filesArray, serviceUuid, accountUuid, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function removeFilesFromServiceCheckIfAccountIsAppAdmin(filesArray, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, (error, isAppAdmin) =>
  {
    if(error != null) return callback(error);

    if(isAppAdmin) return removeFilesFromServiceBrowse(filesArray, 0, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);

    return removeFilesFromServiceCheckAccountRightsOnService(filesArray, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFilesFromServiceCheckAccountRightsOnService(filesArray, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(accountRightsOnService.isAdmin == false && accountRightsOnService.removeFiles == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_DELETE_FILES, detail: null });

    return removeFilesFromServiceBrowse(filesArray, 0, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFilesFromServiceBrowse(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  if(filesArray[index] == undefined) return callback(null);

  return removeFilesFromServiceCheckIfFileExistsInDatabase(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
}

/****************************************************************************************************/

function removeFilesFromServiceCheckIfFileExistsInDatabase(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(filesArray[index], databaseConnection, globalParameters, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return removeFilesFromServiceBrowse(filesArray, (index + 1), serviceUuid, accountUuid, databaseConnection, globalParameters, callback);

    if(fileData.is_deleted) return removeFilesFromServiceCheckIfFileExistsOnStorage(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);

    return removeFilesFromServiceUpdateStatusInDatabase(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFilesFromServiceUpdateStatusInDatabase(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { is_deleted: 1 },
    where: { operator: '=', key: 'uuid', value: filesArray[index] }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return removeFilesFromServiceCreateLog(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFilesFromServiceCreateLog(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppLogsServices.addRemoveFileLog(accountUuid, filesArray[index], databaseConnection, globalParameters, (error) => {  });

  return removeFilesFromServiceCheckIfFileExistsOnStorage(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
}

/****************************************************************************************************/

function removeFilesFromServiceCheckIfFileExistsOnStorage(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  fs.stat(`${globalParameters.storage.root}/${globalParameters.storage.services}/${serviceUuid}/${filesArray[index]}`, (error, stats) =>
  {
    if(error && error.code !== 'ENOENT') return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

    if(error && error.code === 'ENOENT') return removeFilesFromServiceBrowse(filesArray, (index + 1), serviceUuid, accountUuid, databaseConnection, globalParameters, callback);

    return removeFilesFromServiceMoveFileToBin(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFilesFromServiceMoveFileToBin(filesArray, index, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  commonFilesMove.moveFile(`${globalParameters.storage.root}/${globalParameters.storage.services}/${serviceUuid}/${filesArray[index]}`, `${globalParameters.storage.root}/${globalParameters.storage.bin}/${filesArray[index]}`, (error) =>
  {
    if(error != null) return callback(error);

    return removeFilesFromServiceBrowse(filesArray, (index + 1), serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

module.exports =
{
  removeFilesFromService: removeFilesFromService
}

/****************************************************************************************************/