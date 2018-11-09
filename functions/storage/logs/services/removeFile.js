'use strict'

const fs                          = require('fs');
const constants                   = require(`${__root}/functions/constants`);
const filesCreate                 = require(`${__root}/functions/files/create`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);

/****************************************************************************************************/

module.exports.addRemoveFileLog = (logType, accountId, fileUuid, serviceUuid, databaseConnection, params, callback) =>
{
  if(logType == undefined || accountId == undefined || fileUuid == undefined || serviceUuid == undefined || databaseConnection == undefined || params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  if(Object.values(params.fileLogs).includes(logType) == false) return callback({ status: 406, code: constants.LOG_TYPE_DOES_NOT_EXIST, detail: null });

  checkIfFileExistsInDatabase(logType, accountId, fileUuid, serviceUuid, databaseConnection, params, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function checkIfFileExistsInDatabase(logType, accountId, fileUuid, serviceUuid, databaseConnection, params, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: null });

    const currentTimestamp = Date.now();

    addRemoveFileLogInDatabase(logType, accountId, fileData, serviceUuid, currentTimestamp, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function addRemoveFileLogInDatabase(logType, accountId, fileData, serviceUuid, currentTimestamp, databaseConnection, params, callback)
{
  databaseManager.insertQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.fileLogs,
    args: { type: logType, account: accountId, file: fileData.uuid, date: currentTimestamp }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    addRemoveFileLogInJSON(logType, accountId, fileData, serviceUuid, currentTimestamp, params, callback);
  });
}

/****************************************************************************************************/

function addRemoveFileLogInJSON(logType, accountId, fileData, serviceUuid, currentTimestamp, params, callback)
{
  filesCreate.createFile(`${fileData.uuid}.json`, `${params.storage.root}/${params.storage.fileLogs}/${serviceUuid}`, (error) =>
  {
    if(error != null) return callback(error);

    fs.readFile(`${params.storage.root}/${params.storage.fileLogs}/${serviceUuid}/${fileData.uuid}.json`, (error, data) =>
    {
      if(error) return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

      const date = new Date(currentTimestamp);

      var fileContent = {};
          
      if(data.length > 0) fileContent = JSON.parse(data);

      const index = Object.keys(fileContent).length;

      fileContent[index] = {};
      fileContent[index]['date'] = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;
      fileContent[index]['account'] = accountId;
      fileContent[index]['file'] = fileData.uuid;
      fileContent[index]['action'] = logType;

      fs.writeFile(`${params.storage.root}/${params.storage.fileLogs}/${serviceUuid}/${fileData.uuid}.json`, JSON.stringify(fileContent), (error) =>
      {
        if(error) return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

        return callback(null);
      });
    });
  });
}

/****************************************************************************************************/