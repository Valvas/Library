'use strict';

let constants   = require('../constants');
let config      = require('../../json/config');
let SQLSelect   = require('../database/select');

/****************************************************************************************************/

/**
 * Get a JSON object with the rights toward given service for given account
 * @arg {String} serviceName - the key associated to the service from the JSON file "services.json"
 * @arg {String} accountUUID - the UUID associated to the account
 * @arg {Object} SQLConnector - a SQL connector to perform queries to the database
 * @return {Boolean}
 */
module.exports.getUserRightsTowardsService = function(serviceName, accountUUID, SQLConnector, callback)
{
  serviceName == undefined || accountUUID == undefined || SQLConnector == undefined ? callback(false, constants.MISSING_DATA_IN_REQUEST) :

  SQLSelect.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.auth_table,
  
    "args": { "0": "id" },
  
    "where":
    {
      "=":
      {
        "0":
        {
          "key": "uuid",
          "value": accountUUID
        }
      }
    }
  }, SQLConnector, function(trueOrFalse, rowsOrError)
  {
    if(trueOrFalse == false) callback(false, constants.SQL_SERVER_ERROR);

    else
    {
      if(rowsOrError.length == 0) callback(false, constants.ACCOUNT_NOT_FOUND);

      else
      {
        !(serviceName in require('../../json/services')) ? callback(false, constants.SERVICE_NOT_FOUND) :

        SQLSelect.SQLSelectQuery(
        {
          "databaseName": config.database.library_database,
          "tableName": config.database.rights_table,
        
          "args": { "0": "*" },
        
          "where":
          {
            "AND":
            {
              "=":
              {
                "0":
                {
                  "key": "account_id",
                  "value": rowsOrError[0].id
                },

                "1":
                {
                  "key": "service",
                  "value": serviceName
                }
              }
            }
          }
        }, SQLConnector, function(trueOrFalse, rowsOrError)
        {
          if(trueOrFalse == false) callback(false, constants.SQL_SERVER_ERROR);
          
          else
          { 
            rowsOrError.length == 0 ? callback(false, constants.UNAUTHORIZED_TO_ACCESS_SERVICE) : callback(true, rowsOrError[0]);
          }
        });
      }
    }
  });
}

/****************************************************************************************************/

/**
 * Get a boolean which is true if user is admin and false if he is not.
 * @arg {String} accountUUID - the UUID associated to the account to check
 * @arg {Object} SQLConnector - a SQL connector ro perform queries to the database
 * @return {Boolean}
 */
module.exports.checkIfUserIsAdmin = function(accountUUID, SQLConnector, callback)
{
  typeof(accountUUID) != 'string' || SQLConnector == undefined ? callback(false, constants.MISSING_DATA_IN_REQUEST) :

  SQLSelect.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.auth_table,
  
    "args": { "0": "is_admin" },
  
    "where":
    {
      "=":
      {
        "0":
        {
          "key": "uuid",
          "value": accountUUID
        }
      }
    }
  }, SQLConnector, function(trueOrFalse, rowsOrError)
  {
    if(trueOrFalse == false) callback(false, constants.SQL_SERVER_ERROR);

    else
    {
      if(rowsOrError.length == 0) callback(false, constants.ACCOUNT_NOT_FOUND);
      
      else
      {
        rowsOrError[0].is_admin == 0 ? callback(false, constants.USER_IS_NOT_ADMIN) : callback(true, constants.USER_IS_ADMIN);
      }
    }
  });
}

/****************************************************************************************************/