'use strict'

const uuid                      = require('uuid');
const storageAppFilesGet        = require(`${__root}/functions/storage/files/get`);
const storageAppAdminGet        = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

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

module.exports.createFolder = (newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback) =>
{
  if(accountUuid == undefined)          return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(serviceUuid == undefined)          return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(newFolderName == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'newFolderName' });
  if(globalParameters == undefined)     return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(newFolderName.length > globalParameters.storage.maxFolderNameSize) return callback({ status: 406, code: constants.NEW_FOLDER_NAME_BAD_FORMAT, detail: null });

  if(new RegExp('^[a-zA-Z0-9]([ ]?[a-zA-Z0-9]+)*$').test(newFolderName) == false) return callback({ status: 406, code: constants.NEW_FOLDER_NAME_BAD_FORMAT, detail: null });

  createFolderCheckIfServiceExists(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, (error, newFolderUuid) =>
  {
    return callback(error, newFolderUuid);
  });
}

/****************************************************************************************************/

function createFolderCheckIfServiceExists(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    return createFolderCheckAccountRights(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createFolderCheckAccountRights(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.getServiceLevelForEachRight(databaseConnection, globalParameters, (error, serviceRights) =>
  {
    if(error != null) return callback(error);

    storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsLevel) =>
    {
      if(error != null) return callback(error);

      if(serviceRights.createFolders > accountRightsLevel) return callback({ status: 403, code: constants.SERVICE_RIGHTS_LEVEL_TOO_LOW_TO_PERFORM_THIS_REQUEST, detail: null });
    
      return createFolderCheckIfParentFolderExists(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function createFolderCheckIfParentFolderExists(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  if(parentFolderUuid == null) return createFolderCheckIfFolderNameIsAvailable(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);

  storageAppFilesGet.checkIfFolderExistsInDatabase(parentFolderUuid, databaseConnection, globalParameters, (error, folderExists, folderData) =>
  {
    if(error != null) return callback(error);

    if(folderExists == false) return callback({ status: 404, code: constants.PARENT_FOLDER_NOT_FOUND, detail: null });

    return createFolderCheckIfFolderNameIsAvailable(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createFolderCheckIfFolderNameIsAvailable(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppFilesGet.getFolderFromName(newFolderName, serviceUuid, databaseConnection, globalParameters, (error, folderExists, folderData) =>
  {
    if(error != null) return callback(error);

    if(folderExists) return callback({ status: 406, code: constants.FOLDER_NAME_NOT_AVAILABLE, detail: null });

    return createFolderAddInDatabase(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createFolderAddInDatabase(newFolderName, parentFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { uuid: generatedUuid, name: newFolderName, parent_folder: parentFolderUuid == null ? '' : parentFolderUuid, service_uuid: serviceUuid, is_directory: 1, is_deleted: 0 }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return createFolderCreateLog(generatedUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createFolderCreateLog(folderUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { uuid: generatedUuid, element_uuid: folderUuid, account_uuid: accountUuid, date: Date.now(), type: globalParameters.fileLogs.folderCreated }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, folderUuid);
  });
}

/****************************************************************************************************/