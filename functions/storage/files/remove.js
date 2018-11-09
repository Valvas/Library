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

module.exports.removeFiles = (filesToRemove, serviceUuid, accountID, databaseConnection, params, callback) =>
{
  filesToRemove         == undefined ||
  serviceUuid           == undefined ||
  accountID             == undefined ||
  databaseConnection    == undefined ||
  params                == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  getAccountData(filesToRemove, serviceUuid, accountID, databaseConnection, params, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function getAccountData(filesToRemove, serviceUuid, accountID, databaseConnection, params, callback)
{
  accountsGet.getAccountUsingID(accountID, databaseConnection, (error, account) =>
  {
    if(error != null) return callback(error);

    checkAccountRights(filesToRemove, serviceUuid, account, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkAccountRights(filesToRemove, serviceUuid, account, databaseConnection, params, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, account.id, databaseConnection, params, (error, accountRights) =>
  {
    if(error != null) return callback(error);

    if(accountRights.remove == 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_DELETE_FILES, detail: null });

    browseFilesToRemove(filesToRemove, serviceUuid, account, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function browseFilesToRemove(filesToRemove, serviceUuid, account, databaseConnection, params, callback)
{
  var index = 0;

  var fileBrowser = () =>
  {
    storageAppFilesGet.getFileFromDatabaseUsingUuid(filesToRemove[index], databaseConnection, params, (error, fileExists, fileData) =>
    {
      if(error != null) return callback(error);

      if(fileExists == false)
      {
        if(filesToRemove[index += 1] == undefined) return callback(null);

        fileBrowser();
      }

      else
      {
        storageAppLogsRemoveFile.addRemoveFileLog(params.fileLogs.remove, account.id, filesToRemove[index], serviceUuid, databaseConnection, params, (error) => {  });

        filesRemove.moveFileToBin(fileData.uuid, fileData.ext, `${params.storage.root}/${params.storage.services}/${serviceUuid}`, (error) =>
        {
          if(error != null) return callback(error);

          storageAppFilesSet.setFileDeletedInDatabase(fileData.uuid, databaseConnection, params, (error) =>
          {
            if(error != null) return callback(error);

            if(filesToRemove[index += 1] == undefined) return callback(null);

            fileBrowser();
          });
        });
      }
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