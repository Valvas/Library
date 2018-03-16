'use strict'

const fs                  = require('fs');
const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.getFileFromDatabase = (fileName, fileExt, service, databaseConnector, callback) =>
{
  fileName            == undefined ||
  fileExt             == undefined ||
  service             == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },
    'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'name', 'value': fileName }, '1': { 'key': 'ext', 'value': fileExt }, '2': { 'key': 'service', 'value': service } } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: fileOrErrorMessage });

    else
    {
      if(fileOrErrorMessage.length == 0) callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE });

      else if(fileOrErrorMessage[0].deleted == 1) callback({ status: 404, code: constants.FILE_HAS_BEEN_DELETED });

      else
      {
        callback(null, fileOrErrorMessage[0]);
      }
    }
  });
}

/****************************************************************************************************/

module.exports.getFileFromDisk = (fileName, fileExt, serviceName, databaseConnector, callback) =>
{
  fileName            == undefined ||
  fileExt             == undefined ||
  serviceName         == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  fs.stat(`${params.storage.root}/${params.storage.services}/${serviceName}/${fileName}.${fileExt}`, (err, stats) =>
  {
    if(err && err.code != 'ENOENT') callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: err.message });

    else if(err && err.code == 'ENOENT') callback({ status: 404, code: constants.FILE_NOT_FOUND_ON_DISK });

    else
    {
      callback(null, stats);
    }
  });
}

/****************************************************************************************************/

module.exports.getFileFromDatabaseUsingID = (fileID, databaseConnector, callback) =>
{
  fileID                == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
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