'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const storageAppFilesGet  = require(`${__root}/functions/storage/files/get`);

/****************************************************************************************************/

module.exports.setFileOwner = (accountId, fileUuid, databaseConnection, params, callback) =>
{
  accountId             == undefined ||
  fileUuid              == undefined ||
  params                == undefined ||
  databaseConnection    == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: null });

    databaseManager.updateQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.files,
      args: { account: accountId },
      where: { operator: '=', key: 'uuid', value: fileUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/

module.exports.setFileNotDeletedInDatabase = (fileUuid, databaseConnection, params, callback) =>
{
  fileUuid              == undefined ||
  params                == undefined ||
  databaseConnection    == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: null });

    databaseManager.updateQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.files,
      args: { deleted: 0 },
      where: { operator: '=', key: 'uuid', value: fileUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/

module.exports.setFileDeletedInDatabase = (fileUuid, databaseConnection, params, callback) =>
{
  params                == undefined ||
  fileUuid              == undefined ||
  databaseConnection    == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: null });

    databaseManager.updateQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.files,
      args: { deleted: 1 },
      where: { operator: '=', key: 'uuid', value: fileUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/
// UPDATE FOLDER NAME
/****************************************************************************************************/

module.exports.setNewFolderName = (folderUuid, newFolderName, serviceUuid, accountId, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountId == undefined)          return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(folderUuid == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'folderUuid' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(newFolderName == undefined)      return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'newFolderName' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(new RegExp('^[a-zA-Z0-9]([ ]?[a-zA-Z0-9]+)*$').test(newFolderName) == false) return callback({ status: 406, code: constants.NEW_FOLDER_NAME_BAD_FORMAT, detail: null });

  getFolderFromDatabase(folderUuid, newFolderName, serviceUuid, accountId, databaseConnection, params, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function getFolderFromDatabase(folderUuid, newFolderName, serviceUuid, accountId, databaseConnection, params, callback)
{
  storageAppFilesGet.checkIfFolderExistsInDatabase(folderUuid, databaseConnection, params, (error, folderExists, folderData) =>
  {
    if(error != null) return callback(error);

    if(folderExists == false) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    if(folderData.service !== serviceUuid) return callback({ status: 406, code: constants.FOLDER_NOT_PART_OF_PROVIDED_SERVICE, detail: null });

    checkIfNameIsAvailable(folderData, newFolderName, serviceUuid, accountId, databaseConnection, params, callback);
  }); 
}

/****************************************************************************************************/

function checkIfNameIsAvailable(folderData, newFolderName, serviceUuid, accountId, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'name', value: newFolderName }, 1: { operator: '=', key: 'service', value: serviceUuid }, 2: { operator: '=', key: 'parent_folder', value: folderData.parent_folder } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    for(var x = 0; x < result.length; x++)
    {
      if(newFolderName === result[x].name) return callback({ status: 406, code: constants.FOLDER_NAME_NOT_AVAILABLE, detail: null });
    }

    updateFolderNameInDatabase(folderData, newFolderName, serviceUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function updateFolderNameInDatabase(folderData, newFolderName, serviceUuid, accountId, databaseConnection, params, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    args: { name: newFolderName },
    where: { operator: '=', key: 'uuid', value: folderData.uuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/