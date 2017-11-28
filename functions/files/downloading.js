'use strict';

let fs                = require('fs');

let constants         = require('../constants');
let config            = require('../../json/config');
let SQLSelect         = require('../database/select');
let accountRights     = require('../accounts/rights');

/****************************************************************************************************/

/**
 * Check if the file exists in the database and on the disk after checking if user has the right to download files for the current service
 * @arg {String} service - the service to which belongs the file to download
 * @arg {String} fileUUID - the UUID from the database associated to the file
 * @arg {String} accountUUID - the UUID from the database associated to the current user
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
module.exports.downloadFile = function(service, fileUUID, accountUUID, SQLConnector, callback)
{
  if(service == undefined || fileUUID == undefined || accountUUID == undefined || SQLConnector == undefined) callback(false, constants.MISSING_DATA_IN_REQUEST);

  else
  {
    accountRights.getUserRightsTowardsService(service, accountUUID, SQLConnector, function(trueOrFalse, rightsObjectOrErrorCode)
    {
      if(trueOrFalse == false) callback(false, rightsObjectOrErrorCode);

      else
      {
        rightsObjectOrErrorCode.download_files == 0 ? callback(false, constants.UNAUTHORIZED_TO_DOWNLOAD_FILES) :

        SQLSelect.SQLSelectQuery(
        {
          "databaseName": config.database.library_database,
          "tableName": config.database.files_table,
      
          "args":
          {
            "0": "name",
            "1": "type"
          },
      
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
        }, SQLConnector, function(trueOrFalse, rowsOrErrorCode)
        {
          if(trueOrFalse == false) callback(false, rowsOrErrorCode);

          else
          {
            rowsOrErrorCode.length == 0 ? callback(false, constants.FILE_NOT_FOUND_IN_DATABASE) :

            fs.stat(`${config['path_to_root_storage']}/${service}/${rowsOrErrorCode[0].name}.${rowsOrErrorCode[0].type}`, function(err, stat)
            {
              err ? callback(false, constants.FILE_NOT_FOUND_ON_DISK) : callback(true, `${rowsOrErrorCode[0].name}.${rowsOrErrorCode[0].type}`);
            });
          }
        });
      }
    });
  }
}

/****************************************************************************************************/