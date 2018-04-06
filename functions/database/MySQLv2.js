'use strict';

const UUIDModule = require('uuid');

/****************************************************************************************************/

module.exports.dropDatabase = (databaseName, SQLConnector, callback) =>
{
  SQLConnector.query(`DROP DATABASE IF EXISTS ${databaseName}`, (err, result) =>
  {
    err ? callback({ status: 500, error: err.message }) : callback(null);
  });
}

/****************************************************************************************************/

module.exports.insertQuery = (queryObject, SQLConnector, callback) =>
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

  SQLConnector.query(`INSERT INTO ${database}.${table} (${keys}) VALUES (${values})`, (err, result) =>
  {
    if(err) callback(false, err.message);

    else
    {
      callback(true, result.insertId);
    }
  });
}

/****************************************************************************************************/

module.exports.selectQuery = (query, SQLConnector, callback) =>
{
  var sql = `SELECT ${Object.values(query.args).join()} FROM ${query.databaseName}.${query.tableName}`;
  
  var x = 0;
  
  var loop = () =>
  {
    returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], (statement) =>
    {
      sql += statement;
  
      x += 1;
        
      Object.keys(query.where)[x] != undefined ? loop() :
      
      SQLConnector.query(sql, (err, result) =>
      {
        err ? callback(false, err.message) : callback(true, result);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  SQLConnector.query(sql, (err, result) =>
  {
    err ? callback(false, err.message) : callback(true, result);
  });
}

/****************************************************************************************************/

module.exports.updateQuery = (query, SQLConnector, callback) =>
{
  var sql = `UPDATE ${query.databaseName}.${query.tableName} SET `;

  var array = [];
  var x = 0, y = 0;

  var first = () =>
  {
    array.push(`${Object.keys(query.args)[y]} = "${query['args'][Object.keys(query.args)[y]]}"`);

    if(Object.keys(query.args)[y += 1] != undefined) first();

    else
    {
      sql += array.join(',');

      if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
      
      Object.keys(query.where)[x] != undefined ? second() :

      SQLConnector.query(sql, (err, result) =>
      {
        err ? callback(false, err.message) : callback(true, result.affectedRows);
      });
    }
  }

  var second = () =>
  {
    returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], (statement) =>
    {
      sql += statement;
        
      Object.keys(query.where)[x += 1] != undefined ? second() :
      
      SQLConnector.query(sql, (err, result) =>
      {console.log(sql);
        err ? callback(false, err.message) : callback(true, result.affectedRows);
      });
    });
  }

  first();
}

/****************************************************************************************************/

module.exports.deleteQuery = (query, SQLConnector, callback) =>
{
  var sql = `DELETE FROM ${query.databaseName}.${query.tableName}`;
  
  var x = 0;
  
  var loop = () =>
  {
    returnStatement(query['where'][Object.keys(query.where)[x]], [Object.keys(query.where)[x]], (statement) =>
    {
      sql += statement;
  
      x += 1;
        
      Object.keys(query.where)[x] != undefined ? loop() :
      
      SQLConnector.query(sql, (err, result) =>
      {
        err ? callback(false, err.message) : callback(true, result.affectedRows);
      });
    });
  }
  
  if(Object.keys(query.where)[x] != undefined) sql += ' WHERE ';
  
  Object.keys(query.where)[x] != undefined ? loop() :

  SQLConnector.query(sql, (err, result) =>
  {
    err ? callback(false, err.message) : callback(true, result.affectedRows);
  });
}

/****************************************************************************************************/

function returnStatement(object, operands, callback)
{
  var array = [];

  if(object.operator != undefined && (object.operator == 'OR' || object.operator == 'AND'))
  {
    operands.push(object.operator);

    var x = 0;

    var firstLoop = () =>
    {
      returnStatement(object[x], operands, (result) =>
      {
        array.push(result);

        if(object[x += 1] != undefined) firstLoop();

        else
        {
          var result = '(' + array.join(` ${operands.slice(-1)} `) + ')';

          operands.pop();

          callback(result);
        }
      });
    }

    firstLoop();
  }

  else
  {
    operands.push(object.operator);

    var x = 0;

    var secondLoop = () =>
    {
      array.push(` ${object[x].key} ${operands.slice(-1)} "${object[x].value}" `);

      if(object[x += 1] != undefined) secondLoop();

      else
      {
        operands.pop();
        
        var result = '(' + array.join(` ${operands.slice(-1)} `) + ')';

        callback(result);
      }
    }

    secondLoop();
  }
}

/****************************************************************************************************/