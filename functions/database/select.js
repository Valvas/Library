'use strict';

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
    returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], function(statement)
    {
      sql += statement;
  
      x += 1;
        
      Object.keys(query.where)[x] != undefined ? loop() :
      
      connector.query(sql, function(err, result)
      {
        err ? callback(false, undefined) : callback(true, result);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  connector.query(sql, function(err, result)
  {
    err ? callback(false, undefined) : callback(true, result);
  });
}

/****************************************************************************************************/

function returnStatement(object, operands, callback)
{
  let array = [];
  let statement = '';

  let x = 0;

  let first = function()
  {
    if(Object.keys(object)[x] == 'AND' || Object.keys(object)[x] == 'OR' || Object.keys(object)[x] == 'LIKE' || Object.keys(object)[x] == '=' || Object.keys(object)[x] == '!=' || Object.keys(object)[x] == '<' || Object.keys(object)[x] == '>')
    {
      operands.push(Object.keys(object)[x]);

      returnStatement(object[Object.keys(object)[x]], operands, function(result)
      {
        array.push(result);

        x += 1;
        
        if(Object.keys(object)[x] == undefined)
        {          
          statement += `(${array.join(` ${operands.slice(-1)} `)})`;

          if(array.length > 1) operands.pop();
          
          callback(statement);
        }
        
        else
        {
          first();
        }
      });
    }

    else
    {
      second();

      operands.pop();

      statement += array.join(` ${operands.slice(-1)} `);

      operands.pop();
      
      Object.keys(object)[x] == undefined ? callback(statement) : first();
    }
  }

  let second = function()
  {
    array.push(`${object[Object.keys(object)[x]]['key']} ${operands.slice(-1)} "${object[Object.keys(object)[x]]['value']}"`);

    x += 1;

    if(Object.keys(object)[x] != undefined) second();
  }

  first();
}

/****************************************************************************************************/