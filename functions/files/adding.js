'use strict';

var fs                      = require('fs');

var params                  = require(`${__root}/json/config`);
var constants               = require(`${__root}/functions/constants`);
var fileLogs                = require(`${__root}/functions/files/logs`);
var fileDeleting            = require(`${__root}/functions/files/deleting`);
var accountRights           = require(`${__root}/functions/accounts/rights`);
var databaseManager         = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.addOneFile = (service, file, accountUUID, databaseConnector, callback) =>
{
  file.originalname.split('.').length < 2 ? callback(false, 406, constants.UNAUTHORIZED_FILE) :

  accountRights.getUserRightsTowardsService(service, accountUUID, databaseConnector, (rightsOrFalse, errorStatus, errorCode) =>
  {
    if(rightsOrFalse == false) callback(false, errorStatus, errorCode);

    else
    {
      rightsOrFalse.add_files == 0 ? callback(false, 403, constants.UNAUTHORIZED_TO_ADD_FILES) :

      databaseManager.selectQuery(
      {
        'databaseName': params.database.name,
        'tableName': params.database.tables.files,

        'args': { '0': 'id' },

        'where':
        {
          'AND':
          {
            '=':
            {
              '0':
              {
                'key': 'name',
                'value': file.originalname.split('.')[0]
              },
              '1':
              {
                'key': 'type',
                'value': file.originalname.split('.')[1]
              },
              '2':
              {
                'key': 'service',
                'value': service
              }
            }
          }
        }
      }, databaseConnector, (boolean, fileOrErrorMessage) =>
      {
        if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

        else
        {
          fileOrErrorMessage.length > 0 ? callback(false, 406, constants.FILE_ALREADY_EXISTS) :

          fs.stat(`${params.path_to_root_storage}/${service}/${file.originalname}`, (err, stats) =>
          {
            if(err  && err.code != 'ENOENT') callback(false, 500, constants.FILE_SYSTEM_ERROR);

            else
            {
              if(stats != undefined)
              {
                fileDeleting.moveFileToBin(service, file.originalname, (boolean, errorStatus, errorCode) =>
                {
                  boolean == false ? callback(false, errorStatus, errorCode) :

                  addNewFileOnDiskAndInDatabase(service, file, accountUUID, databaseConnector, (boolean, errorStatus, errorCode) =>
                  {
                    if(boolean == false) callback(false, errorStatus, errorCode);

                    else
                    {
                      var logObj =
                      {
                        'service': service,
                        'fileName': file.originalname.split('.')[0],
                        'fileExt': file.originalname.split('.')[1],
                        'content':
                        {
                          'account': accountUUID,
                          'action': 'upload'
                        }
                      }

                      fileLogs.addLog(logObj, (boolean, errorStatus, errorCode) =>
                      {
                        boolean ? callback(true) : callback(false, errorStatus, errorCode);
                      });
                    }
                  });
                });
              }

              else
              {
                addNewFileOnDiskAndInDatabase(service, file, accountUUID, databaseConnector, (boolean, errorStatus, errorCode) =>
                {
                  if(boolean == false) callback(false, errorStatus, errorCode);

                  else
                  {
                    var logObj =
                    {
                      'service': service,
                      'fileName': file.originalname.split('.')[0],
                      'fileExt': file.originalname.split('.')[1],
                      'content':
                      {
                        'account': accountUUID,
                        'action': 'upload'
                      }
                    }

                    fileLogs.addLog(logObj, (boolean, errorStatus, errorCode) =>
                    {
                      boolean ? callback(true) : callback(false, errorStatus, errorCode);
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/

function addNewFileOnDiskAndInDatabase(service, file, accountUUID, databaseConnector, callback)
{
  databaseManager.insertQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.files,

    'uuid': true,
      
    'args':
    {
      'name': file.originalname.split('.')[0],
      'type': file.originalname.split('.')[1],
      'account': accountUUID,
      'service': service
    }
  }, databaseConnector, (boolean, uuidOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      fs.copyFile(`${params.path_to_temp_storage}/${file.originalname}`, `${params.path_to_root_storage}/${service}/${file.originalname}`, (err) =>
      {
        err ? callback(false, 500, constants.FAILED_TO_MOVE_FILE_FROM_TMP) : 
  
        fs.unlink(`${params.path_to_temp_storage}/${file.originalname}`, (err) =>
        {
          err ? callback(false, 500, constants.FAILED_TO_DELETE_FILE_FROM_TMP) : callback(true);
        });
      });
    }
  });
}

/****************************************************************************************************/