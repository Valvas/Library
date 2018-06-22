'use strict';

const UUIDModule = require('uuid');

/****************************************************************************************************/

module.exports.insertQuery = function(queryObject, SQLPool, callback)
{
  var database = queryObject.databaseName;
  var table = queryObject.tableName;

  var keys = Object.keys(queryObject.args).join();
  var values = `"${Object.values(queryObject.args).join('","')}"`;

  var uuid = UUIDModule.v4();

  if(queryObject.uuid == true)
  { 
    keys += ',uuid';
    values += `,"${uuid}"`;
  }

  SQLPool.getConnection((err, SQLConnection) =>
  {
    if(err) callback(false, err.stack);

    else
    {
      SQLConnection.query(`INSERT INTO ${database}.${table} (${keys}) VALUES (${values})`, (err, result) =>
      {
        SQLConnection.release();

        if(err) callback(false, err.stack);

        else
        {
          callback(true, result.insertId);
        }
      });
    }
  });
}

/****************************************************************************************************/

module.exports.selectQuery = function(query, SQLConnection, callback)
{
  var sql = `SELECT ${Object.values(query.args).join()} FROM ${query.databaseName}.${query.tableName}`;

  var x = 0;
  
  var loop = function()
  {
    returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], function(statement)
    {
      sql += statement;
  
      x += 1;
        
      Object.keys(query.where)[x] != undefined ? loop() :
      
      SQLConnection.query(sql, function(err, result)
      {
        err ? callback(false, err.stack) : callback(true, result);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  SQLConnection.query(sql, function(err, result)
  {
    err ? callback(false, err.stack) : callback(true, result);
  });
}

/****************************************************************************************************/

module.exports.updateQuery = function(query, SQLPool, callback)
{
  SQLPool.getConnection((err, SQLConnection) =>
  {
    if(err) callback(false, err.stack);

    else
    {
      var sql = `UPDATE ${query.databaseName}.${query.tableName} SET `;

      var array = [];
      var x = 0, y = 0;

      var first = function()
      {
        array.push(`${Object.keys(query.args)[y]} = "${query['args'][Object.keys(query.args)[y]]}"`);

        if(Object.keys(query.args)[y += 1] != undefined) first();

        else
        {
          sql += array.join();

          if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
          
          Object.keys(query.where)[x] != undefined ? second() :
        
          SQLConnection.query(sql, function(err, result)
          {
            SQLConnection.release();
            err ? callback(false, err.stack) : callback(true, result.affectedRows);
          });
        }
      }

      var second = function()
      {
        returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], function(statement)
        {
          sql += statement;
            
          Object.keys(query.where)[x += 1] != undefined ? second() :
          
          SQLConnection.query(sql, function(err, result)
          {
            SQLConnection.release();
            err ? callback(false, err.stack) : callback(true, result.affectedRows);
          });
        });
      }

      first();
    }
  });
}

/****************************************************************************************************/

module.exports.deleteQuery = function(query, SQLPool, callback)
{
  SQLPool.getConnection((err, SQLConnection) =>
  {
    if(err) callback(false, err.stack);

    else
    {
      var sql = `DELETE FROM ${query.databaseName}.${query.tableName}`;
  
      var x = 0;
      
      var loop = function()
      {
        returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], function(statement)
        {
          sql += statement;
      
          x += 1;
            
          Object.keys(query.where)[x] != undefined ? loop() :
          
          SQLConnection.query(sql, function(err, result)
          {
            SQLConnection.release();
            err ? callback(false, err.stack) : callback(true, result.affectedRows);
          });
        });
      }
      
      if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
      
      Object.keys(query.where)[x] != undefined ? loop() :

      SQLConnection.query(sql, function(err, result)
      {
        SQLConnection.release();
        err ? callback(false, err.stack) : callback(true, result.affectedRows);
      });
    }
  });
}

/****************************************************************************************************/

function returnStatement(object, operands, callback)
{
  var array = [];
  var statement = '';

  var x = 0;

  var first = function()
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
      
      Object.keys(object)[x] == undefined ? callback(statement) : first();
    }
  }

  var second = function()
  {
    array.push(`${object[Object.keys(object)[x]]['key']} ${operands.slice(-1)} "${object[Object.keys(object)[x]]['value']}"`);

    x += 1;

    if(Object.keys(object)[x] != undefined) second();
  }

  first();
}

/****************************************************************************************************/