'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const storageAppfilesGet  = require(`${__root}/functions/storage/files/get`);

/****************************************************************************************************/

module.exports.setFileOwner = (accountId, fileUuid, databaseConnection, params, callback) =>
{
  accountId             == undefined ||
  fileUuid              == undefined ||
  params                == undefined ||
  databaseConnection    == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  storageAppfilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
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

  storageAppfilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
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

  storageAppfilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
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