'use strict';

var params            = require(`${__root}/json/config`);
var constants         = require(`${__root}/functions/constants`);
var fileLogs          = require(`${__root}/functions/files/logs`);
var databaseManager   = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getFile = (fileUUID, accountUUID, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.files,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'uuid', 'value': fileUUID } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      fileOrErrorMessage.length == 0 ? callback(false, 404, constants.FILE_NOT_FOUND) :

      databaseManager.selectQuery(
      {
        'databaseName': params.database.name,
        'tableName': params.database.tables.rights,
        'args': { '0': '*' },
        'where': { 'AND': { '=': { '0': { 'key': 'account', 'value': accountUUID }, '1': { 'key': 'service', 'value': fileOrErrorMessage[0].service } } } }

      }, databaseConnector, (boolean, rightsOrErrorMessage) =>
      {
        if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

        else
        {
          rightsOrErrorMessage.length == 0 ? callback(false, 403, constants.UNAUTHORIZED_TO_ACCESS_THIS_FILE) :

          databaseManager.selectQuery(
          {
            'databaseName': params.database.name,
            'tableName': params.database.tables.accounts,
            'args': { '0': '*' },
            'where': { '=': { '0': { 'key': 'uuid', 'value': fileOrErrorMessage[0]['account'] } } }

          }, databaseConnector, (boolean, accountOrErrorMessage) =>
          {
            if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

            else
            {
              var file = {};

              file.name = fileOrErrorMessage[0].name;
              file.type = fileOrErrorMessage[0].type;
              file.uuid = fileOrErrorMessage[0].uuid;
              file.deleted = fileOrErrorMessage[0].deleted;
              file.service = fileOrErrorMessage[0].service;

              accountOrErrorMessage.length == 0 ? 
              file.account = '????????' :
              file.account = `${accountOrErrorMessage[0]['firstname'].charAt(0).toUpperCase()}${accountOrErrorMessage[0]['firstname'].slice(1)} ${accountOrErrorMessage[0]['lastname'].toUpperCase()}`;

              databaseManager.selectQuery(
              {
                'databaseName': params.database.name,
                'tableName': params.database.tables.file_logs,
                'args': { '0': '*' },
                'where': { '=': { '0': { 'key': 'file', 'value': fileOrErrorMessage[0]['uuid'] } } }

              }, databaseConnector, (boolean, logsOrErrorMessage) =>
              {
                if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

                else
                {
                  var x = 0;

                  file.logs = {};

                  var logsLoop = () =>
                  {
                    fileLogs.getPreparedLog(logsOrErrorMessage[x], databaseConnector, (logOrFalse, errorStatus, errorCode) =>
                    {
                      if(logOrFalse == false) callback(false, errorStatus, errorCode);

                      else
                      {
                        file.logs[x] = logOrFalse;

                        logsOrErrorMessage[x += 1] == undefined ? callback(file) : logsLoop();
                      }
                    });
                  }

                  logsOrErrorMessage.length == 0 ? callback(file) : logsLoop();
                }
              });
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/