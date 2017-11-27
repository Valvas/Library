'use strict';

let fs                = require('fs');

let constants         = require('../constants');
let config            = require('../../json/config');
let SQLInsert         = require('../database/insert');
let SQLSelect         = require('../database/select');
let SQLDelete         = require('../database/delete');
let accountRights     = require('../accounts/rights');

/****************************************************************************************************/

/**
 * Add a file on the disk and add an entry in the database.
 * @arg {String} service - the name of the service to which the file is associated
 * @arg {Object} file - an object with all data about file to add
 * @arg {String} accountUUID - the UUID of the user which must have the right to add files for the current service
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
module.exports.addOneFile = function(service, file, accountUUID, SQLConnector, callback)
{
  let fileStatus = {};

  accountRights.getUserRightsTowardsService(service, accountUUID, SQLConnector, function(trueOrFalse, rightsObjectOrErrorCode)
  {
    if(trueOrFalse == false) callback(false, rightsObjectOrErrorCode);

    else
    {
      if(rightsObjectOrErrorCode['add_files'] == 0) callback(false, constants.UNAUTHORIZED_TO_ADD_FILES);

      else
      {
        fs.stat(`${config['path_to_root_storage']}/${service}/${file.originalname}`, function(err, stats)
        {
          if(err != undefined && err.code != 'ENOENT') callback(false, constants.FILE_SYSTEM_ERROR);
  
          else
          {
            stats  != undefined ? fileStatus.on_disk = true : fileStatus.on_disk = false;
  
            SQLSelect.SQLSelectQuery(
            {
              "databaseName": config.database.library_database,
              "tableName": config.database.files_table,
          
              "args": { "0": "uuid" },
              
              "where":
              {
                "AND":
                {
                  "=":
                  {
                    "0":
                    {
                      "key": "name",
                      "value": file.originalname.split('.')[0]
                    },
      
                    "1":
                    {
                      "key": "type",
                      "value": file.originalname.split('.')[1]
                    },
      
                    "2":
                    {
                      "key": "service",
                      "value": service
                    }
                  }
                }
              }
            }, SQLConnector, function(trueOrFalse, rowsOrErrorCode)
            {
              if(trueOrFalse == false) callback(false, rowsOrErrorCode);
  
              else
              {
                rowsOrErrorCode.length > 0 ? fileStatus.in_database = true : fileStatus.in_database = false;

                if(fileStatus.on_disk == true && fileStatus.in_database == true) callback(false, constants.FILE_ALREADY_EXISTS);

                if(fileStatus.on_disk == true && fileStatus.in_database == false)
                {
                  deleteOldFileFromDiskBeforeAddingNewOne(service, file, accountUUID, SQLConnector, function(trueOrFalse, fileUuidOrErrorCode)
                  {
                    trueOrFalse ? callback(true, fileUuidOrErrorCode) : callback(false, fileUuidOrErrorCode);
                  });
                }

                if(fileStatus.on_disk == false && fileStatus.in_database == true)
                {
                  deleteOldFileFromDatabaseBeforeAddingNewOne(service, file, rowsOrErrorCode[0].uuid, accountUUID, SQLConnector, function(trueOrFalse, fileUuidOrErrorCode)
                  {
                    trueOrFalse ? callback(true, fileUuidOrErrorCode) : callback(false, fileUuidOrErrorCode);
                  });
                }
                
                if(fileStatus.on_disk == false && fileStatus.in_database == false)
                {
                  addNewFileOnDiskAndInDatabase(service, file, accountUUID, SQLConnector, function(trueOrFalse, entryUuidOrErrorCode)
                  {
                    trueOrFalse ? callback(true, entryUuidOrErrorCode) : callback(false, entryUuidOrErrorCode);
                  });
                }
              }
            });
          }
        });
      }
    }
  });
}

/****************************************************************************************************/

/**
 * Used when a file has been found on the disk but has no associated entry in the database
 * @arg {String} service - the name of the service to which belongs the file
 * @arg {Object} file - a JSON object with all informations about the file
 * @arg {String} accountUUID - the UUID of the user to which belongs the file
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
function deleteOldFileFromDiskBeforeAddingNewOne(service, file, accountUUID, SQLConnector, callback)
{
  fs.unlink(`${config['path_to_root_storage']}/${service}/${file.originalname}`, function(err)
  {
    err ? callback(false, constants.OLD_FILE_NOT_DELETED_FROM_DISK) :

    addNewFileOnDiskAndInDatabase(service, file, accountUUID, SQLConnector, function(trueOrFalse, entryUuidOrErrorCode)
    {
      trueOrFalse ? callback(true, entryUuidOrErrorCode) : callback(false, entryUuidOrErrorCode);
    });
  });
}

/****************************************************************************************************/

/**
 * Used when an entry has been found for the file in the database but does not exist on the disk
 * @arg {String} service - the name of the service to which belongs the file
 * @arg {Object} file - a JSON object with all informations about the file
 * @arg {String} fileUUID - a string that is the UUID associated to the current file
 * @arg {String} accountUUID - the UUID of the user to which belongs the file
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
function deleteOldFileFromDatabaseBeforeAddingNewOne(service, file, fileUUID, accountUUID, SQLConnector, callback)
{
  SQLDelete.SQLDeleteQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.files_table,

    "where":
    {
      "=":
      {
        "0":
        {
          "key": "uuid",
          "value": fileUUID
        }
      }
    }
  }, SQLConnector, function(trueOrFalse, affectedRowsOrErrorCode)
  {
    if(trueOrFalse == false) callback(false, affectedRowsOrErrorCode);

    else
    {
      affectedRowsOrErrorCode == 0 ? callback(false, constants.OLD_FILE_NOT_DELETED_FROM_DATABASE) :

      addNewFileOnDiskAndInDatabase(service, file, accountUUID, SQLConnector, function(trueOrFalse, entryUuidOrErrorCode)
      {
        trueOrFalse ? callback(true, entryUuidOrErrorCode) : callback(false, entryUuidOrErrorCode);
      });
    }
  });
}

/****************************************************************************************************/

/**
 * Move the new file to the folder associated to the service before creating a new entry in the database
 * @arg {String} service - the name of the service which belongs the file
 * @arg {Object} file - a JSON object with all informations about the file
 * @arg {String} accountUUID - the UUID of the user to which belongs the file
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
function addNewFileOnDiskAndInDatabase(service, file, accountUUID, SQLConnector, callback)
{
  SQLInsert.SQLInsertQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.files_table,
      
    "args":
    {
      "name": file.originalname.split('.')[0],
      "type": file.originalname.split('.')[1],
      "account": accountUUID,
      "service": service
    }
  }, SQLConnector, function(trueOrFalse, entryUuidOrErrorCode)
  {
    if(trueOrFalse == false) callback(false, entryUuidOrErrorCode);

    else
    {
      fs.copyFile(`${config['path_to_temp_storage']}/${file.originalname}`, `${config['path_to_root_storage']}/${service}/${file.originalname}`, function(err)
      {
        err ? callback(false, constants.FAILED_TO_MOVE_FILE_FROM_TMP) : 
  
        fs.unlink(`${config['path_to_temp_storage']}/${file.originalname}`, function(err)
        {
          err ? callback(false, constants.FAILED_TO_DELETE_FILE_FROM_TMP) : callback(true, entryUuidOrErrorCode);
        });
      });
    }
  });
}

/****************************************************************************************************/