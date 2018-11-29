'use strict'

const fs                        = require('fs');
const constants                 = require(`${__root}/functions/constants`);
const storageStrings            = require(`${__root}/json/strings/storage`);
const commonFormatDate          = require(`${__root}/functions/common/format/date`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const databaseManager           = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

function checkIfFileExistsInDatabase(fileName, serviceUuid, parentFolder, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'service_uuid', value: serviceUuid }, 1: { operator: '=', key: 'name', value: fileName }, 2: { operator: '=', key: 'parent_folder', value: parentFolder == null ? '' : parentFolder }, 3: { operator: '=', key: 'is_directory', value: 0 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

function checkIfFolderExistsInDatabase(folderUuid, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'uuid', value: folderUuid }, 1: { operator: '=', key: 'is_directory', value: 1 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

function getFolderFromName(folderName, serviceUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'name', value: folderName }, 1: { operator: '=', key: 'is_directory', value: 1 }, 2: { operator: '=', key: 'is_deleted', value: 0 }, 3: { operator: '=', key: 'service_uuid', value: serviceUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

function checkIfFileExistsOnStorage(fileUuid, serviceUuid, params, callback)
{
  fs.stat(`${params.storage.root}/${params.storage.services}/${serviceUuid}/${fileUuid}`, (error, stats) =>
  {
    if(error && error.code != 'ENOENT') return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

    if(error && error.code == 'ENOENT') return callback(null, false);

    return callback(null, true, stats);
  });
}

/****************************************************************************************************/

function getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, globalParameters, callback)
{
  if(fileUuid == undefined)           return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: fileUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

function getFilesFromService(serviceUuid, folderUuid, databaseConnection, globalParameters, callback)
{
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });
  
  var resultObject = {};
  resultObject.files = [];
  resultObject.folders = [];

  resultObject.parentFolder = folderUuid;

  var queryObject = {};

  queryObject.databaseName = globalParameters.database.storage.label;
  queryObject.tableName = globalParameters.database.storage.tables.serviceElements;
  queryObject.args = [ '*' ];

  if(folderUuid != null) queryObject.where = { condition: 'AND', 0: { operator: '=', key: 'service_uuid', value: serviceUuid }, 1: { operator: '=', key: 'is_deleted', value: 0 }, 2: { operator: '=', key: 'parent_folder', value: folderUuid } };
  if(folderUuid == null) queryObject.where = { condition: 'AND', 0: { operator: '=', key: 'service_uuid', value: serviceUuid }, 1: { operator: '=', key: 'is_deleted', value: 0 }, 2: { operator: '=', key: 'parent_folder', value: '' } };

  databaseManager.selectQuery(queryObject, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, resultObject);

    for(var x = 0; x < result.length; x++)
    {
      result[x].is_directory == true
      ? resultObject.folders.push({ uuid: result[x].uuid, name: result[x].name })
      : resultObject.files.push({ uuid: result[x].uuid, name: result[x].name });
    }

    return callback(null, resultObject);
  });
}

/****************************************************************************************************/
// GET PARENT FOLDER FROM ELEMENT
/****************************************************************************************************/

function getParentFolder(childUuid, serviceUuid, databaseConnection, params, callback)
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(childUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'childUuid' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: childUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0)
    {
      databaseManager.selectQuery(
      {
        databaseName: params.database.storage.label,
        tableName: params.database.storage.tables.files,
        args: [ '*' ],
        where: { operator: '=', key: 'uuid', value: childUuid }
    
      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        if(result.length == 0) return callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE, detail: null });

        storageAppFilesGet.checkIfFolderExistsInDatabase(result[0].parent_folder, databaseConnection, params, (error, folderExists, folderData) =>
        {
          if(error != null) return callback(error);

          if(folderExists == false) return callback(null, true);

          return callback(null, false, folderData);
        });
      });
    }

    else
    {
      storageAppFilesGet.checkIfFolderExistsInDatabase(result[0].parent_folder, databaseConnection, params, (error, folderExists, folderData) =>
      {
        if(error != null) return callback(error);

        if(folderExists == false) return callback(null, true);

        return callback(null, false, folderData);
      });
    }
  });
}

/****************************************************************************************************/
// GET FILE LOGS
/****************************************************************************************************/

function getFileLogs(fileUuid, databaseConnection, globalParameters, callback)
{
  if(fileUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileUuid' });
  if(globalParameters == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  getFileFromDatabase(fileUuid, databaseConnection, globalParameters, (error, fileData, fileLogs) =>
  {
    return callback(error, fileData, fileLogs);
  });
}

/****************************************************************************************************/

function getFileFromDatabase(fileUuid, databaseConnection, globalParameters, callback)
{
  getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, globalParameters, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE, detail: null });

    getLogsFromFile(fileData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function getLogsFromFile(fileData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: [ '*' ],
    where: { operator: '=', key: 'element_uuid', value: fileData.uuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, fileData, []);

    getAccountLinkedToEachLog(fileData, result, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function getAccountLinkedToEachLog(fileData, logsData, databaseConnection, globalParameters, callback)
{
  var preparedLogs = [], index = 0;

  var browseLogs = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(logsData[index].account_uuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      preparedLogs[index] = {};

      const accountName = accountExists == false
      ? '?'
      : `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}`;

      var message = '';

      switch(logsData[index].type)
      {
        case 0: message = `${storageStrings.services.fileDetail.logs.uploaded} ${accountName}`; break;
        case 1: message = `${storageStrings.services.fileDetail.logs.downloaded} ${accountName}`; break;
        case 2: message = `${storageStrings.services.fileDetail.logs.removed} ${accountName}`; break;
        case 3: message = `${storageStrings.services.fileDetail.logs.commented} ${accountName}`; break;
      }

      commonFormatDate.getStringifyDateFromTimestamp(logsData[index].date, (error, stringifyTimestamp) =>
      {
        if(error != null) return callback(error);

        preparedLogs[index].date = stringifyTimestamp;
        preparedLogs[index].message = message;
        preparedLogs[index].type = logsData[index].type;
        preparedLogs[index].uuid = logsData[index].uuid;

        if(logsData[index].type === 3) preparedLogs[index].comment = logsData.comment;

        if(logsData[index += 1] == undefined) return callback(null, fileData, preparedLogs);

        browseLogs();
      });
    });
  }

  browseLogs();
}

/****************************************************************************************************/

function getFolderPath(folderUuid, currentPath, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: folderUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    currentPath.push({ uuid: result[0].uuid, name: result[0].name });

    if(result[0].parent_folder.length === 0) return callback(null, currentPath);

    return getFolderPath(result[0].parent_folder, currentPath, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

module.exports =
{
  getFileLogs: getFileLogs,
  getFolderPath: getFolderPath,
  getFolderFromName: getFolderFromName,
  getFilesFromService: getFilesFromService,
  checkIfFileExistsOnStorage: checkIfFileExistsOnStorage,
  checkIfFileExistsInDatabase: checkIfFileExistsInDatabase,
  getFileFromDatabaseUsingUuid: getFileFromDatabaseUsingUuid,
  checkIfFolderExistsInDatabase: checkIfFolderExistsInDatabase
}

/****************************************************************************************************/