'use strict';

const UUIDModule = require('uuid');

/****************************************************************************************************/

module.exports.SQLInsertQuery = function(queryObject, SQLConnector, callback)
{
  let database = queryObject.databaseName;
  let table = queryObject.tableName;

  let keys = Object.keys(queryObject.args).join();
  let values = `"${Object.values(queryObject.args).join('","')}"`;

  let uuid = UUIDModule.v4();

  if(queryObject.uuid == true)
  { 
    keys += ',uuid';
    values += `,"${uuid}"`;
  }

  SQLConnector.query(`INSERT INTO ${database}.${table} (${keys}) VALUES (${values})`, (err, result) =>
  {
    if(err) callback(false, err.message);

    else
    {
      queryObject.uuid == true ? callback(true, uuid) : callback(true, result.insertId);
    }
  });
}

/****************************************************************************************************/

module.exports.SQLSelectQuery = function(query, SQLConnector, callback)
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
      
      SQLConnector.query(sql, function(err, result)
      {
        err ? callback(false, err.message) : callback(true, result);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  SQLConnector.query(sql, function(err, result)
  {
    err ? callback(false, err.message) : callback(true, result);
  });
}

/****************************************************************************************************/

module.exports.SQLUpdateQuery = function(query, SQLConnector, callback)
{
  let sql = `UPDATE ${query.databaseName}.${query.tableName} SET `;

  let array = [];
  let x = 0, y = 0;

  let first = function()
  {
    array.push(`${Object.keys(query.args)[y]} = "${query['args'][Object.keys(query.args)[y]]}"`);

    if(Object.keys(query.args)[y += 1] != undefined) first();

    else
    {
      if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
      
      Object.keys(query.where)[x] != undefined ? second() :
    
      SQLConnector.query(sql, function(err, result)
      {
        err ? callback(false, err.message) : callback(true, result.affectedRows);
      });
    }
  }

  let second = function()
  {
    returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], function(statement)
    {
      sql += statement;
        
      Object.keys(query.where)[x += 1] != undefined ? second() :
      
      SQLConnector.query(sql, function(err, result)
      {
        err ? callback(false, err.message) : callback(true, result.affectedRows);
      });
    });
  }

  first();
}

/****************************************************************************************************/

module.exports.SQLDeleteQuery = function(query, SQLConnector, callback)
{
  let sql = `DELETE FROM ${query.databaseName}.${query.tableName}`;
  
  let x = 0;
  
  let loop = function()
  {
    returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], function(statement)
    {
      sql += statement;
  
      x += 1;
        
      Object.keys(query.where)[x] != undefined ? loop() :
      
      SQLConnector.query(sql, function(err, result)
      {
        err ? callback(false, err.message) : callback(true, result.affectedRows);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  SQLConnector.query(sql, function(err, result)
  {
    err ? callback(false, err.message) : callback(true, result.affectedRows);
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

      SQLCommon.returnStatement(object[Object.keys(object)[x]], operands, function(result)
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