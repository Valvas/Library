'use strict';

var fs                      = require('fs');

var config                  = require(`${__root}/json/config`);
var constants               = require(`${__root}/functions/constants`);
var fileLogs                = require(`${__root}/functions/files/logs`);
var fileCommon              = require(`${__root}/functions/files/common`);
var accountRights           = require(`${__root}/functions/accounts/rights`);
var databaseManager         = require(`${__root}/functions/database/${config.database.dbms}`);

var fileDeleting = module.exports = {};

/****************************************************************************************************/

fileDeleting.deleteOneFile = (service, fileUUID, accountUUID, databaseConnector, params, callback) =>
{
  accountRights.getUserRightsTowardsService(service, accountUUID, databaseConnector, (rightsOrFalse, errorStatus, errorCode) =>
  {
    if(rightsOrFalse == false) callback(false, errorStatus, errorCode);

    else
    {
      rightsOrFalse.remove_files == 0 ? callback(false, 403, constants.UNAUTHORIZED_TO_DELETE_FILES) :

      databaseManager.selectQuery(
      {
        'databaseName': config.database.name,
        'tableName': config.database.tables.files,
        'args': { '0': '*' },
        'where': { 'AND': { '=': { '0': { 'key': 'deleted', 'value': '0' }, '1': { 'key': 'uuid', 'value': fileUUID } } } }

      }, databaseConnector, (boolean, fileOrErrorMessage) =>
      {
        if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

        else
        {
          fileOrErrorMessage.length == 0 ? callback(false, 404, constants.FILE_NOT_FOUND_IN_DATABASE) :

          databaseManager.updateQuery(
          {
            'databaseName': config.database.name,
            'tableName': config.database.tables.files,
            'args': { 'deleted': '1' },
            'where': { '=': { '0': { 'key': 'uuid', 'value': fileUUID } } }

          }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
          {
            if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
      
            else
            {
              updatedRowsOrErrorMessage.length == 0 ? callback(false, 500, constants.FILE_NOT_DELETED_FROM_DATABASE) :

              fileLogs.addLogInDatabase(config.file_logs.remove, accountUUID, undefined, fileUUID, databaseConnector, (logIdOrFalse, errorStatus, errorCode) =>
              {
                logIdOrFalse == false ? callback(false, errorStatus, errorCode) :
                
                fs.stat(`${params.storage.root}/${service}/${fileOrErrorMessage[0].name}.${fileOrErrorMessage[0].type}`, (err, stats) =>
                {
                  err ? callback(false, 404, constants.FILE_NOT_FOUND_ON_DISK) :

                  fileDeleting.moveFileToBin(service, `${fileOrErrorMessage[0].name}.${fileOrErrorMessage[0].type}`, params, (boolean, errorStatus, errorCode) =>
                  {
                    boolean == false ? callback(false, errorStatus, errorCode) :

                    fs.unlink(`${params.storage.root}/${service}/${fileOrErrorMessage[0].name}.${fileOrErrorMessage[0].type}`, (err) =>
                    {
                      if(err) callback(false, 500, constants.FILE_NOT_DELETED_FROM_DISK);
                      
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
                            'action': 'delete'
                          }
                        }
    
                        fileLogs.addLog(logObj, params, (boolean, errorStatus, errorCode) =>
                        {
                          boolean ? callback(logIdOrFalse) : callback(false, errorStatus, errorCode);
                        });
                      }
                    });
                  });
                });
              });
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/

fileDeleting.moveFileToBin = (service, file, params, callback) =>
{
  var date = new Date(Date.now());
  
  var deletedFileName = `${file.split('.')[0]}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()} ${date.getHours()}h${date.getMinutes()}m${date.getSeconds()}s.${file.split('.')[1]}`;

  fileCommon.createFolder(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`, `${params.storage.root}/${config.path_to_bin_storage}`, (pathOrFalse, errorStatus, errorCode) =>
  {
    if(pathOrFalse == false) callback(false, errorStatus, errorCode);

    else
    {
      fs.copyFile(`${params.storage.root}/${service}/${file}`, `${pathOrFalse}/${deletedFileName}`, (err) =>
      {
        err ? callback(false, 500, constants.FILE_SYSTEM_ERROR) : callback(true);
      });
    }
  });
}

/****************************************************************************************************/