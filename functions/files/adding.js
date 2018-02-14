'use strict';

var fs                      = require('fs');

var config                  = require(`${__root}/json/config`);
var constants               = require(`${__root}/functions/constants`);
var fileLogs                = require(`${__root}/functions/files/logs`);
var fileCommon              = require(`${__root}/functions/files/common`);
var fileDeleting            = require(`${__root}/functions/files/deleting`);
var accountRights           = require(`${__root}/functions/accounts/rights`);
var databaseManager         = require(`${__root}/functions/database/${config.database.dbms}`);

/****************************************************************************************************/

module.exports.addOneFile = (service, fileName, accountUUID, databaseConnector, params, callback) =>
{
  fileName.split('.').length < 2 ? callback(false, 406, constants.UNAUTHORIZED_FILE) :

  accountRights.getUserRightsTowardsService(service, accountUUID, databaseConnector, (rightsOrFalse, errorStatus, errorCode) =>
  {
    if(rightsOrFalse == false) callback(false, errorStatus, errorCode);

    else
    {
      rightsOrFalse.add_files == 0 ? callback(false, 403, constants.UNAUTHORIZED_TO_ADD_FILES) :

      databaseManager.selectQuery(
      {
        'databaseName': config.database.name,
        'tableName': config.database.tables.files,
        'args': { '0': '*' },
        'where': { 'AND': { '=': { '0': { 'key': 'name', 'value': fileName.split('.')[0] }, '1': { 'key': 'type', 'value': fileName.split('.')[1] }, '2': { 'key': 'service', 'value': service } } } }

      }, databaseConnector, (boolean, fileOrErrorMessage) =>
      {
        if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

        else
        {
          if(fileOrErrorMessage.length > 0 && fileOrErrorMessage[0].deleted == 0) callback(false, 406, constants.FILE_ALREADY_EXISTS);

          else
          {
            fs.stat(`${params.storage.root}/${service}/${fileName}`, (err, stats) =>
            {
              if(err  && err.code != 'ENOENT') callback(false, 500, constants.FILE_SYSTEM_ERROR);

              else
              {
                var fileUUID = fileOrErrorMessage.length > 0 ? fileOrErrorMessage[0].uuid : false;

                if(stats != undefined)
                {
                  fileDeleting.moveFileToBin(service, fileName, (boolean, errorStatus, errorCode) =>
                  {
                    boolean == false ? callback(false, errorStatus, errorCode) :

                    addNewFileOnDiskAndInDatabase(service, fileName, accountUUID, fileUUID, databaseConnector, params, (error, data) =>
                    {
                      if(error != null) callback(error);

                      else
                      {
                        var logObj =
                        {
                          'service': service,
                          'fileName': fileName.split('.')[0],
                          'fileExt': fileName.split('.')[1],
                          'content':
                          {
                            'account': accountUUID,
                            'action': 'upload'
                          }
                        }

                        fileLogs.addLog(logObj, params, (boolean, errorStatus, errorCode) =>
                        {
                          boolean == true ? callback(null, data) : callback({ status: errorStatus, code: errorCode });
                        });
                      }
                    });
                  });
                }

                else
                {
                  addNewFileOnDiskAndInDatabase(service, fileName, accountUUID, fileUUID, databaseConnector, params, (error, data) =>
                  {
                    if(error != null) callback(error);

                    else
                    {
                      var logObj =
                      {
                        'service': service,
                        'fileName': fileName.split('.')[0],
                        'fileExt': fileName.split('.')[1],
                        'content':
                        {
                          'account': accountUUID,
                          'action': 'upload'
                        }
                      }

                      fileLogs.addLog(logObj, params, (boolean, errorStatus, errorCode) =>
                      {
                        boolean == true ? callback(null, data) : callback({ status: errorStatus, code: errorCode });
                      });
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  });
}

/****************************************************************************************************/

function addNewFileOnDiskAndInDatabase(service, fileName, accountUUID, fileUUID, databaseConnector, params, callback)
{
  fileUUID == false ?

  databaseManager.insertQuery(
  {
    'databaseName': config.database.name,
    'tableName': config.database.tables.files,
    'uuid': true,
    'args': { 'name': fileName.split('.')[0], 'type': fileName.split('.')[1], 'account': accountUUID, 'service': service, 'deleted': 0 }

  }, databaseConnector, (boolean, fileIdOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

    else
    {
      databaseManager.selectQuery(
      {
        'databaseName': config.database.name,
        'tableName': config.database.tables.files,
        'args': { '0': 'uuid' },
        'where': { '=': { '0': { 'key': 'id', 'value': fileIdOrErrorMessage } } }
        
      }, databaseConnector, (boolean, fileOrErrorMessage) =>
      {
        if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

        else
        {
          fileLogs.addLogInDatabase(config.file_logs.upload, accountUUID, undefined, fileOrErrorMessage[0].uuid, databaseConnector, (logIDOrFalse, errorStatus, errorCode) =>
          {
            logIDOrFalse == false ? callback({ status: errorStatus, code: errorCode }) :

            copyFile(fileName, service, params, (error) =>
            {
              error == null ? callback(null, { logID: logIDOrFalse, fileUUID: fileOrErrorMessage[0].uuid }) : callback({ status: errorStatus, code: errorCode });
            });
          });
        }
      });
    }
  }) :

  databaseManager.updateQuery(
  {
    'databaseName': config.database.name,
    'tableName': config.database.tables.files,
    'args': { 'account': accountUUID, 'deleted': 0 },
    'where': { '=': { '0': { 'key': 'uuid', 'value': fileUUID } } }

  }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });
  
    else
    {
      fileLogs.addLogInDatabase(config.file_logs.upload, accountUUID, undefined, fileUUID, databaseConnector, (logIDOrFalse, errorStatus, errorCode) =>
      {
        logIDOrFalse == false ? callback(false, errorStatus, errorCode) :

        copyFile(fileName, service, params, (error) =>
        {
          error == null ? callback(null, { logID: logIDOrFalse, fileUUID: fileOrErrorMessage[0].uuid }) : callback({ status: errorStatus, code: errorCode });
        });
      });
    }
  });
}

/****************************************************************************************************/

function copyFile(fileName, service, params, callback)
{
  fileCommon.createFolder(service, params.storage.root, (pathOrFalse, errorStatus, errorCode) =>
  {
    pathOrFalse == false ? callback({ status: errorStatus, code: errorCode }) :

    fs.copyFile(`${params.storage.root}/${config.path_to_temp_storage}/${fileName}`, `${params.storage.root}/${service}/${fileName}`, (err) =>
    {
      err ? callback({ status: 500, code: constants.FAILED_TO_MOVE_FILE_FROM_TMP }) : 
            
      fs.unlink(`${params.storage.root}/${config.path_to_temp_storage}/${fileName}`, (err) =>
      {
        err ? callback({ status: 500, code: constants.FAILED_TO_DELETE_FILE_FROM_TMP }) : callback(null);
      });
    });
  });
}

/****************************************************************************************************/