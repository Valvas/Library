'use strict'

const fs                        = require('fs');
const params                    = require(`${__root}/json/params`);
const constants                 = require(`${__root}/functions/constants`);
const storageStrings            = require(`${__root}/json/strings/storage`);
const accountsGet               = require(`${__root}/functions/accounts/get`);
const commonFormatDate          = require(`${__root}/functions/common/format/date`);
const commonAccountsGet         = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesRights  = require(`${__root}/functions/storage/services/rights`);

//To uncomment when updated database manager will be set for all the project
//const oldDatabaseManager         = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const oldDatabaseManager           = require(`${__root}/functions/database/MySQLv2`);
const databaseManager              = require(`${__root}/functions/database/MySQLv3`);

const storageAppFilesGet = module.exports = {};

/****************************************************************************************************/

storageAppFilesGet.checkIfFileExistsInDatabase = (fileName, fileExt, serviceUuid, folderUuid, databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.files,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'name', value: fileName }, 1: { operator: '=', key: 'ext', value: fileExt }, 2: { operator: '=', key: 'service', value: serviceUuid }, 3: { operator: '=', key: 'parent_folder', value: folderUuid == null ? '' : folderUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

storageAppFilesGet.checkIfFolderExistsInDatabase = (folderUuid, databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: folderUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, false);

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

storageAppFilesGet.getFileFromDatabaseUsingUuid = (fileUuid, databaseConnection, params, callback) =>
{
  fileUuid              == undefined ||
  params                == undefined ||
  databaseConnection    == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.files,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: fileUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, false);

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

storageAppFilesGet.getFilesFromService = (serviceUuid, accountId, folderUuid, databaseConnection, params, callback) =>
{
  accountsGet.getAccountUsingID(accountId, databaseConnection, (error, account) =>
  {
    if(error != null) return callback(error);

    storageAppServicesRights.getRightsTowardsService(serviceUuid, accountId, databaseConnection, params, (error, rights) =>
    {
      if(error != null) return callback(error);

      var objectWithFiles = {};

      objectWithFiles.parentFolder = folderUuid;

      var queryObject = {};

      queryObject.databaseName = params.database.storage.label;
      queryObject.tableName = params.database.storage.tables.files;
      queryObject.args = [ '*' ];

      if(folderUuid != null) queryObject.where = { condition: 'AND', 0: { operator: '=', key: 'service', value: serviceUuid }, 1: { operator: '=', key: 'deleted', value: 0 }, 2: { operator: '=', key: 'parent_folder', value: folderUuid } };
      if(folderUuid == null) queryObject.where = { condition: 'AND', 0: { operator: '=', key: 'service', value: serviceUuid }, 1: { operator: '=', key: 'deleted', value: 0 }, 2: { operator: '=', key: 'parent_folder', value: '' } };

      browseFiles(queryObject, databaseConnection, (error, files) =>
      {
        if(error != null) return callback(error);

        objectWithFiles.files = files;

        queryObject.tableName = params.database.storage.tables.folders;

        browseFolders(queryObject, databaseConnection, (error, folders) =>
        {
          if(error != null) return callback(error);

          objectWithFiles.folders = folders;

          return callback(null, objectWithFiles);
        });
      });
    });
  });
}

/****************************************************************************************************/

function browseFiles(queryObject, databaseConnection, callback)
{
  databaseManager.selectQuery(queryObject, databaseConnection, (error, result) =>
  {
    if(error != null) return callback(error);

    if(result.length == 0) return callback(null, []);

    var index = 0, files = [];

    var fileBrowser = () =>
    {
      files[index] = {};

      files[index].uuid = result[index].uuid;
      files[index].name = result[index].name;
      files[index].extension = result[index].ext;
      files[index].deleted = (result[index].deleted == 1);

      if(result[index += 1] != undefined) fileBrowser();

      else
      {
        return callback(null, files);
      }
    }

    fileBrowser();
  });
}

/****************************************************************************************************/

function browseFolders(queryObject, databaseConnection, callback)
{
  databaseManager.selectQuery(queryObject, databaseConnection, (error, result) =>
  {
    if(error != null) return callback(error);

    if(result.length == 0) return callback(null, []);

    var index = 0, folders = [];

    var folderBrowser = () =>
    {
      folders[index] = {};

      folders[index].uuid = result[index].uuid;
      folders[index].name = result[index].name;

      if(result[index += 1] != undefined) folderBrowser();

      else
      {
        return callback(null, folders);
      }
    }

    folderBrowser();
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

module.exports.getFileLogs = (fileUuid, databaseConnection, params, callback) =>
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
    commonAccountsGet.checkIfAccountExistsFromId(logsData[index].account, databaseConnection, params, (error, accountExists, accountData) =>
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