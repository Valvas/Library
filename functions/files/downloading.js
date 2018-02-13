'use strict';

var fs                    = require('fs');

var config                = require(`${__root}/json/config`);
var constants             = require(`${__root}/functions/constants`);
var fileLogs              = require(`${__root}/functions/files/logs`);
var accountGet            = require(`${__root}/functions/accounts/get`);
var accountRights         = require(`${__root}/functions/accounts/rights`);
var databaseManager       = require(`${__root}/functions/database/${config.database.dbms}`);

/****************************************************************************************************/

module.exports.downloadFile = (service, fileUUID, accountUUID, databaseConnector, params, callback) =>
{
  service == undefined || fileUUID == undefined || accountUUID == undefined || databaseConnector == undefined ?
  
  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  accountRights.getUserRightsTowardsService(service, accountUUID, databaseConnector, (rightsOrFalse, errorStatus, errorCode) =>
  {
    if(rightsOrFalse == false) callback(false, errorStatus, errorCode);

    else
    {
      rightsOrFalse.download_files == 0 ? callback(false, 403, constants.UNAUTHORIZED_TO_DOWNLOAD_FILES) :

      databaseManager.selectQuery(
      {
        'databaseName': config.database.name,
        'tableName': config.database.tables.files,

        'args':
        {
          '0': 'name',
          '1': 'type'
        },

        'where':
        {
          '=':
          {
            '0':
            {
              'key': 'uuid',
              'value': fileUUID
            }
          }
        }
      }, databaseConnector, (boolean, fileOrErrorMessage) =>
      {
        if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

        else
        {
          fileOrErrorMessage.length == 0 ? callback(false, 404, constants.FILE_NOT_FOUND_IN_DATABASE) :
          
          fs.stat(`${params.storage.root}/${service}/${fileOrErrorMessage[0].name}.${fileOrErrorMessage[0].type}`, (err, stats) =>
          {
            if(err) callback(false, 404, constants.FILE_NOT_FOUND_ON_DISK);

            else
            {
              fileLogs.addLogInDatabase(config.file_logs.download, accountUUID, undefined, fileUUID, databaseConnector, (logIDOrFalse, errorStatus, errorCode) =>
              {
                if(logIDOrFalse == false) callback(false, errorStatus, errorCode);

                else
                {
                  var logObj =
                  {
                    'service': service,
                    'fileName': fileOrErrorMessage[0].name,
                    'fileExt': fileOrErrorMessage[0].type,
                    'content':
                    {
                      'account': accountUUID,
                      'action': 'download'
                    }
                  }

                  fileLogs.addLog(logObj, params, (boolean, errorStatus, errorCode) =>
                  {
                    boolean ? callback(`${fileOrErrorMessage[0].name}.${fileOrErrorMessage[0].type}`, logIDOrFalse) : callback(false, errorStatus, errorCode);
                  });
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