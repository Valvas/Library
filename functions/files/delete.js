'use strict';

let fs                = require('fs');

let constants         = require('../constants');
let config            = require('../../json/config');
let SQLDelete         = require('../database/delete');
let SQLSelect         = require('../database/select');
let accountRights     = require('../accounts/rights');

let fileRemoval = module.exports = {};

/****************************************************************************************************/

/**
 * Delete a file from the disk and from the database.
 * @arg {String} service - the name of the service to which the file is associated
 * @arg {String} fileUUID - the UUID of the file to delete from the database
 * @arg {String} accountUUID - the UUID of the user which must have the right to delete files for the current service
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Object}
 */
fileRemoval.deleteOneFile = function(service, fileUUID, accountUUID, SQLConnector, callback)
{
  let returnObject = {};

  findFileInTheDatabaseUsingItsUUID(service, fileUUID, SQLConnector, function(trueOrFalse, fileNameOrErrorCode)
  {
    if(trueOrFalse == false) callback({ 'findFileInTheDatabaseUsingItsUUID': { 'result': false, 'code': fileNameOrErrorCode } });

    else
    {
      returnObject['findFileInTheDatabaseUsingItsUUID'] = { 'result': true, 'code': constants.FILE_FOUND_IN_THE_DATABASE };

      checkIfUserHasTheRightToDeleteFiles(service, accountUUID, SQLConnector, function(trueOrFalse, returnCode)
      {
        if(trueOrFalse == false) callback({ 'checkIfUserHasTheRightToDeleteFiles': { 'result': false, 'code': returnCode } });
    
        else
        {
          returnObject['checkIfUserHasTheRightToDeleteFiles'] = { 'result': true, 'code': returnCode };
    
          fileRemoval.deleteFileFromHardware(service, fileNameOrErrorCode, function(trueOrFalse, returnCode)
          {
            returnObject['deleteFileFromHardware'] = { 'result': trueOrFalse, 'code': returnCode };
    
            fileRemoval.deleteFileFromDatabase(fileUUID, SQLConnector, function(trueOrFalse, returnCode)
            {
              returnObject['deleteFileFromDatabase'] = { 'result': trueOrFalse, 'code': returnCode };
  
              callback(returnObject);
            });
          });
        }
      });
    } 
  });
}

/****************************************************************************************************/

/**
 * Find a file from the database using its UUID
 * @arg {String} service - the name of the service to which the file belongs
 * @arg {String} fileUUID - the UUID of the file to find in the database
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {String}
 */
function findFileInTheDatabaseUsingItsUUID(service, fileUUID, SQLConnector, callback)
{
  SQLSelect.SQLSelectQuery(
    {
      "databaseName": config.database.library_database,
      "tableName": config.database.files_table,

      "args": { "0": "name", "1": "type" },
    
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
    }, SQLConnector, function(success, fileDataOrErrorCode)
    {
      if(success == false) callback(false, fileDataOrErrorCode);
  
      else
      {
        fileDataOrErrorCode == 0 ? callback(false, constants.FILE_NOT_FOUND_IN_DATABASE) : callback(true, `${fileDataOrErrorCode[0].name}.${fileDataOrErrorCode[0].type}`);
      }
    });
}

/****************************************************************************************************/

/**
 * Check if user has the right to delete a file for the current service
 * @arg {String} service - the name of the service to which user must have the right to delete files
 * @arg {String} accountUUID - the UUID associated to the account to check
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
function checkIfUserHasTheRightToDeleteFiles(service, accountUUID, SQLConnector, callback)
{
  accountRights.getUserRightsTowardsService(service, accountUUID, SQLConnector, function(trueOrFalse, rightsObjectOrErrorCode)
  {
    if(trueOrFalse == false) callback(false, rightsObjectOrErrorCode);

    else
    {
      rightsObjectOrErrorCode.remove_files == 0 ? callback(false, constants.UNAUTHORIZED_TO_DELETE_FILES) : callback(true, constants.AUTHORIZED_TO_DELETE_FILES);
    }
  });
}

/****************************************************************************************************/

/**
 * Delete a file from its folder
 * @arg {String} service - the name of the service to which belongs the file
 * @arg {String} file - the name of the file with its extension
 * @return {Boolean}
 */
fileRemoval.deleteFileFromHardware = function(service, file, callback)
{
  fs.stat(`${config['path_to_root_storage']}/${service}/${file}`, function(err, stat)
  {
    err ? callback(false, constants.FILE_NOT_FOUND_ON_DISK) :

    fs.unlink(`${config['path_to_root_storage']}/${service}/${file}`, function(err)
    {
      err ? callback(false, constants.FILE_NOT_DELETED_FROM_DISK) : callback(true, constants.FILE_DELETED_FROM_DISK);
    });
  });
}

/****************************************************************************************************/

/**
 * Delete a file from the database
 * @arg {String} fileUUID - the UUID associated to the file to delete
 * @arg {Object} SQLConnector - a SQL connector to perform queries to the database
 * @return {Boolean}
 */
fileRemoval.deleteFileFromDatabase = function(fileUUID, SQLConnector, callback)
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
  }, SQLConnector, function(success, deletedRowsOrErrorCode)
  {
    if(success == false) callback(false, deletedRowsOrErrorCode);

    else
    {
      deletedRowsOrErrorCode == 0 ? callback(false, constants.FILE_NOT_FOUND_IN_DATABASE) : callback(true, constants.FILE_DELETED_FROM_DATABASE);
    }
  });
}