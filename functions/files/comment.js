'use strict';

var params                  = require(`${__root}/json/config`);
var constants               = require(`${__root}/functions/constants`);
var fileLogs                = require(`${__root}/functions/files/logs`);
var databaseManager         = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.addComment = (fileUUID, accountUUID, commentContent, databaseConnector, callback) =>
{
  fileUUID            == undefined ||
  accountUUID         == undefined ||
  commentContent      == undefined ||
  databaseConnector   == undefined ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.files,
    'args': { '0': 'id' },
    'where': { '=': { '0': { 'key': 'uuid', 'value': fileUUID } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      fileOrErrorMessage.length == 0 ? callback(false, 404, constants.FILE_NOT_FOUND) :

      databaseManager.insertQuery(
      {
        'databaseName': params.database.name,
        'tableName': params.database.tables.file_logs,
        'uuid': false,
        'args': { 'type': params.file_logs.comment, 'account': accountUUID, 'file': fileUUID, 'date': Date.now() }
      
      }, databaseConnector, (boolean, logIdOrErrorMessage) =>
      {
        boolean == false ? callback(false, 500, constants.SQL_SERVER_ERROR) :
      
        databaseManager.insertQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.file_comments,
          'uuid': false,
          'args': { 'log': logIdOrErrorMessage, 'content': commentContent }
      
        }, databaseConnector, (boolean, commentIdOrErrorMessage) =>
        {
          boolean == false ? callback(false, 500, constants.SQL_SERVER_ERROR) : callback(logIdOrErrorMessage);
        });
      });
    }
  });
}

/****************************************************************************************************/