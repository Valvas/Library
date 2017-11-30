'use strict';

let SQLCommon         = require('./common');

/*
  queryObject ->
  {
    "databaseName": [arg1],
    "tableName": [arg2],

    "where":
    {
      "or":
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

  DELETE FROM arg1.arg2 WHERE (key1 = "value1" OR key2 != "value2");

  callback -> [true] : success | [false] : error
*/

/****************************************************************************************************/

/**
 * Perform a DELETE SQL query to the database and table given in parameters
 * @arg {Object} query - a JSON object with query args
 * @arg {Object} connector - a SQL connector to perform queries
 * @arg {Function} callback 
 */
module.exports.SQLDeleteQuery = function(query, connector, callback)
{
  let sql = `DELETE FROM ${query.databaseName}.${query.tableName}`;
  
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
        err ? callback(false, err.message) : callback(true, result.affectedRows);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  connector.query(sql, function(err, result)
  {
    err ? callback(false, err.message) : callback(true, result.affectedRows());
  });
}

/****************************************************************************************************/