'use strict'

const fs                        = require('fs');
const constants                 = require(`${__root}/functions/constants`);
const storageStrings            = require(`${__root}/json/strings/storage`);
const commonFormatDate          = require(`${__root}/functions/common/format/date`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const databaseManager           = require(`${__root}/functions/database/MySQLv3`);

const storageAppFilesGet = module.exports = {};

/****************************************************************************************************/

storageAppFilesGet.checkIfFileExistsInDatabase = (fileName, serviceUuid, parentFolder, databaseConnection, params, callback) =>
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

storageAppFilesGet.checkIfFolderExistsInDatabase = (folderUuid, databaseConnection, params, callback) =>
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

storageAppFilesGet.getFolderFromName = (folderName, serviceUuid, databaseConnection, globalParameters, callback) =>
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

storageAppFilesGet.checkIfFileExistsOnStorage = (fileUuid, fileExt, serviceUuid, params, callback) =>
{
  fs.stat(`${params.storage.root}/${params.storage.services}/${serviceUuid}/${fileUuid}.${fileExt}`, (error, stats) =>
  {
    if(error && error.code != 'ENOENT') return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

    if(error && error.code == 'ENOENT') return callback(null, false);

    return callback(null, true, stats);
  });
}

/****************************************************************************************************/

storageAppFilesGet.getFileFromDatabaseUsingID = (fileID, databaseConnector, callback) =>
{
  fileID                == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  oldDatabaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': fileID } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: fileOrErrorMessage });

    else
    {
      fileOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE }) :
      callback(null, fileOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

storageAppFilesGet.getFileFromDatabaseUsingUuid = (fileUuid, databaseConnection, globalParameters, callback) =>
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

storageAppFilesGet.getFileFromDatabaseUsingFullName = (fileName, fileExt, serviceID, databaseConnector, callback) =>
{
  fileName              == undefined ||
  fileExt               == undefined ||
  serviceID             == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  oldDatabaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },
    'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'name', 'value': fileName }, '1': { 'key': 'ext', 'value': fileExt }, '2': { 'key': 'service', 'value': serviceID } } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: fileOrErrorMessage });

    else
    {
      fileOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE }) :
      callback(null, fileOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

storageAppFilesGet.getFilesFromService = (serviceUuid, folderUuid, databaseConnection, globalParameters, callback) =>
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

storageAppFilesGet.getParentFolder = (childUuid, serviceUuid, databaseConnection, params, callback) =>
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

function getFileLogs(fileUuid, databaseConnection, params, callback)
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(fileUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  getFileFromDatabase(fileUuid, databaseConnection, params, (error, fileData, fileLogs) =>
  {
    return callback(error, fileData, fileLogs);
  });
}

/****************************************************************************************************/

function getFileFromDatabase(fileUuid, databaseConnection, params, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE, detail: null });

    getLogsFromFile(fileData, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getLogsFromFile(fileData, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.fileLogs,
    args: [ '*' ],
    where: { operator: '=', key: 'file', value: fileData.uuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, fileData, []);

    getAccountLinkedToEachLog(fileData, result, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getAccountLinkedToEachLog(fileData, logsData, databaseConnection, params, callback)
{
  var preparedLogs = [], index = 0;

  var browseLogs = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(logsData[index].account, databaseConnection, params, (error, accountExists, accountData) =>
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

        if(logsData[index].type === 3)
        {
          databaseManager.selectQuery(
          {
            databaseName: params.database.storage.label,
            tableName: params.database.storage.tables.fileComments,
            args: [ '*' ],
            where: { operator: '=', key: 'log', value: logsData[index].id }

          }, databaseConnection, (error, result) =>
          {
            if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

            if(result.length === 0) return callback({ status: 404, code: constants.COMMENT_NOT_FOUND, detail: null });

            preparedLogs[index].comment = result[0].content;

            if(logsData[index += 1] == undefined) return callback(null, fileData, preparedLogs);

            browseLogs();
          });
        }

        else
        {
          if(logsData[index += 1] == undefined) return callback(null, fileData, preparedLogs);

          browseLogs();
        }
      });
    });
  }

  browseLogs();
}

/****************************************************************************************************/

storageAppFilesGet.getFolderPath = (folderUuid, currentPath, databaseConnection, globalParameters, callback) =>
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

    return storageAppFilesGet.getFolderPath(result[0].parent_folder, currentPath, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/