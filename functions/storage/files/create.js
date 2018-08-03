'use strict'

const storageAppFilesGet  = require(`${__root}/functions/storage/files/get`);

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.createFileInDatabase = (fileName, fileExtension, parentFolder, accountId, serviceUuid, databaseConnection, params, callback) =>
{
  fileName            == undefined ||
  fileExtension       == undefined ||
  accountId           == undefined ||
  serviceUuid         == undefined ||
  databaseConnection  == undefined ||
  params              == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  databaseManager.insertQueryWithUUID(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.files,
    args: { name: fileName, ext: fileExtension, account: accountId, service: serviceUuid, deleted: 0, parent_folder: parentFolder }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null, result);
  });
}

/****************************************************************************************************/
// CREATE A NEW FOLDER FOR A SERVICE
/****************************************************************************************************/

module.exports.createNewFolder = (newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback) =>
{
  newFolderName         == undefined || typeof(newFolderName)     !== 'string' ||
  parentFolderUuid      == undefined || typeof(parentFolderUuid)  !== 'string' ||
  serviceUuid           == undefined || typeof(serviceUuid)       !== 'string' ||
  databaseConnection    == undefined ||
  params                == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  checkNewFolderName(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, (error, newFolderUuid) =>
  {
    if(error != null) return callback(error);

    return callback(null, newFolderUuid);
  });
}

/****************************************************************************************************/

function checkNewFolderName(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  if(new RegExp('^[a-zA-Z0-9]([ ]?[a-zA-Z0-9]+)*$').test(newFolderName) == false) return callback({ status: 406, code: constants.NEW_FOLDER_NAME_BAD_FORMAT, detail: null });

  checkIfServiceExists(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback);
}

/****************************************************************************************************/

function checkIfServiceExists(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    checkIfParentFolderExists(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkIfParentFolderExists(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  if(parentFolderUuid.length === 0) checkIfFolderNameIsAvailable(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback);

  else
  {
    storageAppFilesGet.checkIfFolderExistsInDatabase(parentFolderUuid, databaseConnection, params, (error, folderExists, folderData) =>
    {
      if(error != null) return callback(error);

      if(folderExists == false) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

      if(folderData.service !== serviceUuid) return callback({ status: 406, code: constants.FOLDER_NOT_PART_OF_PROVIDED_SERVICE, detail: null });

      checkIfFolderNameIsAvailable(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback);
    });
  }
}

/****************************************************************************************************/

function checkIfFolderNameIsAvailable(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'name', value: newFolderName }, 1: { operator: '=', key: 'service', value: serviceUuid }, 2: { operator: '=', key: 'parent_folder', value: parentFolderUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    for(var x = 0; x < result.length; x++)
    {
      if(newFolderName === result[x].name) return callback({ status: 406, code: constants.FOLDER_NAME_NOT_AVAILABLE, detail: null });
    }

    createNewFolderInTheDatabase(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function createNewFolderInTheDatabase(newFolderName, parentFolderUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  databaseManager.insertQueryWithUUID(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    args: { name: newFolderName, account: accountId, service: serviceUuid, parent_folder: parentFolderUuid, deleted: 0 }

  }, databaseConnection, (error, result, insertedUuid) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null, insertedUuid);
  });
}

/****************************************************************************************************/