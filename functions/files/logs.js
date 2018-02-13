'use strict';

var fs                  = require('fs');
var logs                = require(`${__root}/json/logs`);
var config              = require(`${__root}/json/config`);
var constants           = require(`${__root}/functions/constants`);
var formatDate          = require(`${__root}/functions/format/date`);
var filesCommon         = require(`${__root}/functions/files/common`);
var databaseManager     = require(`${__root}/functions/database/${config.database.dbms}`);

var filesLogs = module.exports = {};

/****************************************************************************************************/

filesLogs.addLog = (obj, params, callback) =>
{
  filesCommon.createFolder(config.path_to_file_logs_storage, `${params.storage.root}/${config.path_to_logs_storage}`, (pathOrFalse, errorStatus, errorCode) =>
  {
    pathOrFalse == false ? callback(false, errorStatus, errorCode) :

    filesCommon.createFolder(`service=[${obj.service}]`, pathOrFalse, (pathOrFalse, errorStatus, errorCode) =>
    {
      pathOrFalse == false ? callback(false, errorStatus, errorCode) :

      fs.stat(`${pathOrFalse}/${obj.fileName}[${obj.fileExt}].json`, (err, stats) =>
      {
        if(err != undefined && err.code != 'ENOENT') callback(false, 500, constants.FILE_SYSTEM_ERROR);

        else if(err != undefined && err.code == 'ENOENT' || stats.isDirectory())
        {
          fs.open(`${pathOrFalse}/${obj.fileName}[${obj.fileExt}].json`, 'w', (err, fd) =>
          {
            err ? callback(false, 500, constants.FILE_SYSTEM_ERROR) :

            addLogInFile(`${obj.fileName}[${obj.fileExt}].json`, pathOrFalse, obj.content, (boolean, errorStatus, errorCode) =>
            {
              boolean ? callback(true) : callback(false, errorStatus, errorCode);
            });
          });
        }

        else
        {
          addLogInFile(`${obj.fileName}[${obj.fileExt}].json`, pathOrFalse, obj.content, (boolean, errorStatus, errorCode) =>
          {
            boolean ? callback(true) : callback(false, errorStatus, errorCode);
          });
        }
      });
    });
  });
}

/****************************************************************************************************/

function addLogInFile(file, path, obj, callback)
{
  fs.readFile(`${path}/${file}`, (err, data) =>
  {
    if(err) callback(false, 500, constants.FILE_SYSTEM_ERROR);

    else
    {
      var json;

      data.length > 0 ? json = JSON.parse(data) : json = {};

      var date = new Date(Date.now());

      var key = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

      if(json[key] == undefined) json[key] = {};

      json[key][Object.keys(json[key]).length] = {};

      json[key][Object.keys(json[key]).length - 1] = obj;

      fs.writeFile(`${path}/${file}`, JSON.stringify(json), (err) =>
      {
        err ? callback(false, 500, constants.FILE_SYSTEM_ERROR) : callback(true);
      });
    }
  });
}

/****************************************************************************************************/

filesLogs.addLogInDatabase = (logType, accountUUID, commentContent, fileUUID, databaseConnector, callback) =>
{
  logType               == undefined ||
  accountUUID           == undefined ||
  fileUUID              == undefined ||
  databaseConnector     == undefined ?

  callback(false, 404, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.insertQuery(
  {
    'databaseName': config.database.name,
    'tableName': config.database.tables.file_logs,
    'uuid': false,
    'args':
    {
      'type': logType,
      'account': accountUUID,
      'file': fileUUID,
      'date': Date.now()
    }
  }, databaseConnector, (boolean, insertedIdOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      logType != config.file_logs.comment ? callback(insertedIdOrErrorMessage) :

      addCommentInDatabase(insertedIdOrErrorMessage, commentContent, databaseConnector, (boolean, errorStatus, errorCode) =>
      {
        boolean ? callback(insertedIdOrErrorMessage) : callback(false, errorStatus, errorCode);
      });
    }
  });
}

/****************************************************************************************************/

function addCommentInDatabase(logId, commentContent, databaseConnector, callback)
{
  logId             == undefined ||
  commentContent    == undefined ||
  databaseConnector == undefined ?

  callback(false, 404, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.insertQuery(
  {
    'databaseName': config.database.name,
    'tableName': config.database.tables.file_comments,
    'uuid': false,
    'args':
    {
      'log': logId,
      'content': commentContent
    }
  }, databaseConnector, (boolean, insertedIdOrErrorMessage) =>
  {
    boolean ? callback(true) : callback(false, 500, constants.SQL_SERVER_ERROR);
  });
}

/****************************************************************************************************/

filesLogs.getPreparedLog = (log, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': config.database.name,
    'tableName': config.database.tables.accounts,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'uuid', 'value': log.account } } }

  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      var preparedLog = {};

      formatDate.getStringifyDateFromTimestamp(log.date, (stringifyDateOrFalse, errorStatus, errorCode) =>
      {
        if(stringifyDateOrFalse == false) callback(false, errorStatus, errorCode);

        else
        {
          preparedLog.date = stringifyDateOrFalse;
          
          accountOrErrorMessage.length == 0 ?

          preparedLog.message = `${logs['file_logs'][log.type]} ?????? ??????` :
          preparedLog.message = `${logs['file_logs'][log.type]} ${accountOrErrorMessage[0].firstname.charAt(0).toUpperCase()}${accountOrErrorMessage[0].firstname.slice(1).toLowerCase()} ${accountOrErrorMessage[0].lastname.toUpperCase()}`;
        
          preparedLog.type = log.type;

          preparedLog.id = log.id;
          
          log.type == config.file_logs.comment ?

          databaseManager.selectQuery(
          {
            'databaseName': config.database.name,
            'tableName': config.database.tables.file_comments,
            'args': { '0': 'content' },
            'where': { '=': { '0': { 'key': 'log', 'value': log.id } } }
            
          }, databaseConnector, (boolean, commentOrErrorMessage) =>
          {
            if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

            else
            {
              commentOrErrorMessage.length == 0 ?

              preparedLog.comment = '...' :
              preparedLog.comment = commentOrErrorMessage[0].content;

              callback(preparedLog);
            }
          }) :

          callback(preparedLog);          
        }
      });
    }
  });
}

/****************************************************************************************************/

filesLogs.getFileLog = (logID, databaseConnector, callback) =>
{
  logID == undefined ||
  databaseConnector == undefined ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': config.database.name,
    'tableName': config.database.tables.file_logs,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'id', 'value': logID } } }

  }, databaseConnector, (boolean, logOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      logOrErrorMessage.length == 0 ? callback(false, 404, constants.LOG_NOT_FOUND) :

      filesLogs.getPreparedLog(logOrErrorMessage[0], databaseConnector, (preparedLogOrFalse, errorStatus, errorCode) =>
      {
        preparedLogOrFalse == false ? callback(false, errorStatus, errorCode) : callback(preparedLogOrFalse);
      });
    }
  });
}

/****************************************************************************************************/