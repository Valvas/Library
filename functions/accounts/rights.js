'use strict';

let config      = require('../../json/config');
let SQLSelect   = require('../database/select');

const ERROR = 0;
const MISSING_DATA = 1;
const ACCOUNT_NOT_FOUND = 2;
const SERVICE_NOT_FOUND = 3;
const UNAUTHORIZED_TO_ACCESS_SERVICE = 4;

/****************************************************************************************************/

/**
 * Get a JSON object with the rights toward given service for given account
 * @arg {String} serviceName - the key associated to the service from the JSON file "services.json"
 * @arg {String} accountUUID - the UUID associated to the account
 * @arg {Object} SQLConnector - a SQL connector to perform queries to the database
 * @arg {Function} callback - Success : get a boolean and a JSON object | Error : get a boolean and an integer
 */
module.exports.getUserRightsTowardsService = function(serviceName, accountUUID, SQLConnector, callback)
{
  serviceName == undefined || accountUUID == undefined || SQLConnector == undefined ? callback(false, MISSING_DATA) :

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
  }, SQLConnector, function(success, rows)
  {
    if(success == false) callback(false, ERROR);

    else
    {
      if(rows.length == 0) callback(false, ACCOUNT_NOT_FOUND);

      else
      {
        !(serviceName in require('../../json/services')) ? callback(false, SERVICE_NOT_FOUND) :

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
                  "value": rows[0].id
                },

                "1":
                {
                  "key": "service",
                  "value": serviceName
                }
              }
            }
          }
        }, SQLConnector, function(success, rows)
        {
          if(success == false) callback(false, ERROR);
          
          else
          { 
            rows.length == 0 ? callback(false, UNAUTHORIZED_TO_ACCESS_SERVICE) : callback(true, rows[0]);
          }
        });
      }
    }
  });
}

/****************************************************************************************************/