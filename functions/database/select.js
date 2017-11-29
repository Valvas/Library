'use strict';

let SQLCommon         = require('./common');
let constants         = require('../constants');

/*
  queryObject ->
  {
    "databaseName": [arg1],
    "tableName": [arg2],

    "args":
    {
      "0": "[arg3]",
      "1": "[arg4]",
      "2": "[arg5]"
    },

    "where":
    {
      "OR":
      {
        "=":
        {
          "0":
          {
            "key": "[key1]",
            "value": "[value1]"
          }
        },
        "!=":
        {
          "0":
          {
            "key": "[key2]",
            "value": "[value2]"
          }
        }
      }
    }
  }

  SELECT arg3,arg4,arg5 FROM arg1.arg2 WHERE (key1 = "value1" OR key2 != "value2");

  callback -> [true] + [result] : success | [false] + [undefined] : error
*/

/****************************************************************************************************/

/**
 * Perform a SELECT SQL query to the database and table given in parameters
 * @arg {Object} query - a JSON object with query args
 * @arg {Object} connector - a SQL connector to perform queries
 * @arg {Function} callback 
 */
module.exports.SQLSelectQuery = function(query, connector, callback)
{
  let sql = `SELECT ${Object.values(query.args).join()} FROM ${query.databaseName}.${query.tableName}`;
  
  let x = 0;
  
  let loop = function()
  {
    SQLCommon.returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], function(statement)
    {
      sql += statement;
  
      x += 1;
        
      Object.keys(query.where)[x] != undefined ? loop() :
      
      connector.query(sql, function(err, result)
      {
        err ? callback(false, constants.SQL_SERVER_ERROR) : callback(true, result);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  connector.query(sql, function(err, result)
  {
    err ? callback(false, constants.SQL_SERVER_ERROR) : callback(true, result);
  });
}

/****************************************************************************************************/