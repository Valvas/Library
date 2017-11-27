'use strict';

let constants           = require('./constants');
let encryption          = require('./encryption');
let config              = require('../json/config');
let SQLSelect           = require('./database/select');

let services = module.exports = {};

/****************************************************************************************************/

/**
 * Get file information for the given service
 * @arg {String} service - the name of the service from which files must be searched
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
services.getFilesFromOneService = function(service, SQLConnector, callback)
{
  SQLConnector == undefined || service == undefined ? callback(false, constants.MISSING_DATA_IN_REQUEST) :

  SQLSelect.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.files_table,
  
    "args": { "0": "name", "1": "type", "2": "account", "3": "uuid" },
      
    "where":
    {
      "=":
      {
        "0":
        {
          "key": "service",
          "value": service
        }
      }
    }
  }, SQLConnector, function(trueOrFalse, rowsOrErrorCode)
  {
    if(trueOrFalse == false) callback(false, rowsOrErrorCode);

    else
    {
      rowsOrErrorCode.length == 0 ? callback(true, {}) :

      getFilesOwners(rowsOrErrorCode, SQLConnector, function(trueOrFalse, filesObjectOrErrorCode)
      {
        trueOrFalse ? callback(true, filesObjectOrErrorCode) : callback(false, filesObjectOrErrorCode);
      });
    }
  });
}

/****************************************************************************************************/

/**
 * Get owner's name for each file gotten for the service
 * @arg {Object} files - a JSON object with all file information
 * @arg {Object} SQLConnector - a SQL connector to perform queries in the database
 * @return {Boolean}
 */
function getFilesOwners(files, SQLConnector, callback)
{
  let x = 0;

  let loop = function(file)
  {
    SQLSelect.SQLSelectQuery(
    {
      "databaseName": config.database.library_database,
      "tableName": config.database.auth_table,
      
      "args": { "0": "firstname", "1": "lastname" },
          
      "where":
      {
        "=":
        {
          "0":
          {
            "key": "uuid",
            "value": file.account
          }
        }
      }
    }, SQLConnector, function(trueOrFalse, rowsOrErrorCode)
    {
      if(trueOrFalse == false) callback(false, rowsOrErrorCode);

      else
      {
        rowsOrErrorCode.length == 0 ? 
        files[Object.keys(files)[x]]['account'] = '??????' : 
        files[Object.keys(files)[x]]['account'] = `${rowsOrErrorCode[0]['firstname']} ${rowsOrErrorCode[0]['lastname'].toUpperCase()}`;
        
        Object.keys(files)[x += 1] != undefined ? loop(files[Object.keys(files)[x]]) : callback(true, files);
      }
    });
  }

  loop(files[Object.keys(files)[x]]);
}

/****************************************************************************************************/