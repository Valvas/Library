'use strict'

const constants                           = require(`${__root}/functions/constants`);
const filesRemove                         = require(`${__root}/functions/files/remove`);
const databaseManager                     = require(`${__root}/functions/database/MySQLv3`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppFilesSet                  = require(`${__root}/functions/storage/files/set`);
const commonFilesMove                     = require(`${__root}/functions/common/files/move`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);
const storageAppLogsRemoveFile            = require(`${__root}/functions/storage/logs/services/removeFile`);

/****************************************************************************************************/

module.exports.removeFiles = (filesToRemove, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, callback) =>
{
  if(accountUuid == undefined)          return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(serviceUuid == undefined)          return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(filesToRemove == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'filesToRemove' });
  if(isGlobalAdmin == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'isGlobalAdmin' });
  if(globalParameters == undefined)     return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  checkAccountRights(filesToRemove, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function checkAccountRights(filesToRemove, serviceUuid, accountUuid, isGlobalAdmin, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, serviceRights) =>
  {
    if(error != null) return callback(error);

    if(serviceRights.removeFiles == false && serviceRights.isAdmin == false && isGlobalAdmin == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_DELETE_FILES, detail: null });

    browseFilesToRemove(filesToRemove, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function browseFilesToRemove(filesToRemove, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  var index = 0;

  var fileBrowser = () =>
  {
    storageAppFilesGet.getFileFromDatabaseUsingUuid(filesToRemove[index], databaseConnection, globalParameters, (error, fileExists, fileData) =>
    {
      if(error != null) return callback(error);

      if(fileExists == false)
      {
        if(filesToRemove[index += 1] == undefined) return callback(null);

        return fileBrowser();
      }

      storageAppLogsRemoveFile.addRemoveFileLog(accountUuid, filesToRemove[index], databaseConnection, globalParameters, (error) => {  });

      commonFilesMove.moveFile(`${globalParameters.storage.root}/${globalParameters.storage.services}/${serviceUuid}/${filesToRemove[index]}`, `${globalParameters.storage.root}/${globalParameters.storage.bin}/${filesToRemove[index]}`, (error) =>
      {
        if(error != null) return callback(error);

        databaseManager.updateQuery(
        {
          databaseName: globalParameters.database.storage.label,
          tableName: globalParameters.database.storage.tables.serviceElements,
          args: { is_deleted: 1 },
          where: { operator: '=', key: 'uuid', value: filesToRemove[index] }
      
        }, databaseConnection, (error, result) =>
        {
          if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

          if(filesToRemove[index += 1] == undefined) return callback(null);

          return fileBrowser();
        });
      });
    });
  }

  if(filesToRemove[index] == undefined) return callback(null);

  fileBrowser();
}

/****************************************************************************************************/
// REMOVE FOLDER
/****************************************************************************************************/

module.exports.removeFolder = () =>
{

}

/****************************************************************************************************/
// REMOVE FILE
/****************************************************************************************************/

module.exports.removeFileFromService = (fileUuid, serviceUuid, databaseConnection, params, callback) =>
{
  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceElements,
    args: { is_deleted: 1 },
    where: { operator: '=', key: 'uuid', value: fileUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    commonFilesMove.moveFile(`${params.storage.root}/${params.storage.services}/${serviceUuid}/${fileUuid}`, `${params.storage.root}/${params.storage.bin}/${fileUuid}`, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/