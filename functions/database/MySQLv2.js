'use strict'

const UUIDModule = require('uuid');

/****************************************************************************************************/

module.exports.createDatabaseAndTables = (databasesObject, SQLConnector, callback) =>
{
  var x = 0;

  var createDatabasesLoop = (databaseName, databaseContent) =>
  {
    SQLConnector.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (error, result) =>
    {
      if(error) return callback(error.message);

      else
      {
        console.log(`INFO : database "${databaseName}" created !`);

        createAllTables(databaseContent, databaseName, SQLConnector, (error) =>
        {
          if(error != null) return callback(error);

          if(Object.keys(databasesObject)[x += 1] == undefined) return callback(null);
          
          createDatabasesLoop(Object.keys(databasesObject)[x], databasesObject[Object.keys(databasesObject)[x]]);
        });
      }
    });
  };

  if(Object.keys(databasesObject)[x] == undefined)
  {
    console.log('INFO : no database to create !');

    return callback(null);
  }
  
  else
  {
    createDatabasesLoop(Object.keys(databasesObject)[x], databasesObject[Object.keys(databasesObject)[x]]);
  }
}

/****************************************************************************************************/

function createAllTables(database, databaseName, pool, callback)
{
  var x = 0;

  var loop = (tableName, tableContent) =>
  {
    createTable(tableContent, (result) =>
    {
      if(result == false)
      {
        console.log(`[${databaseName}] : Error - you cannot create a table "${tableName}" with no columns !`);
        Object.keys(database)[x += 1] == undefined ? callback() : loop(Object.keys(database)[x], database[Object.keys(database)[x]]);
      }

      else
      {
        pool.getConnection((err, connection) =>
        {
          if(err)
          {
            console.log(`[${databaseName}] : ${err.message} `);
            callback();
          }

          else
          {
            connection.query(`CREATE TABLE IF NOT EXISTS ${databaseName}.${tableName} (${result})`, function(err, data)
            {
              err ? console.log(`[${databaseName}] : ${err.message} `) : console.log(`[${databaseName}] : table "${tableName}" created !`);
              
              connection.release();
              
              Object.keys(database)[x += 1] == undefined ? callback() : loop(Object.keys(database)[x], database[Object.keys(database)[x]]);
            });
          }
        });
      }
    });
  };

  if(Object.keys(database)[x] == undefined)
  {
    console.log(`INFO : no tables to create for this database !`);
    callback();
  }
  
  else
  {
    loop(Object.keys(database)[x], database[Object.keys(database)[x]]);
  }
}

/****************************************************************************************************/

function createTable(table, callback)
{
  var x = 0;
  var array = [];

  var loop = (field, args) =>
  {
    array.push(`${field} ${args}`);

    Object.keys(table)[x += 1] == undefined ? callback(array.join()) : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
  };

  Object.keys(table)[x] == undefined ? callback(true) : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
}

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

module.exports.insertQueryWithUUID = (queryObject, databaseConnection, callback) =>
{
  const uuid = UUIDModule.v4();

  var keys = Object.keys(queryObject.args).join() + ',uuid';
  var values = `"${Object.values(queryObject.args).join('","')}", "${uuid}"`;

  databaseConnection.qeury(`INSERT INTO ${queryObject.databaseName}.${queryObject.tableName} (${keys}) VALUES (${values})`, (error, result) =>
  {
    console.log(result);

    if(error) return callback(error.message);

    return callback(null);
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
      {
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