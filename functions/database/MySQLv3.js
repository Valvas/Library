'use strict'

const UUIDModule = require('uuid');

/****************************************************************************************************/

module.exports.createDatabaseAndTables = (databasesObject, databaseConnection, callback) =>
{
  var x = 0;

  var createDatabasesLoop = (databaseName, databaseContent) =>
  {
    databaseConnection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (error, result) =>
    {
      if(error) return callback(error.message);

      else
      {
        console.log(`INFO : database "${databaseName}" created !`);

        createAllTables(databaseContent, databaseName, databaseConnection, (error) =>
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

module.exports.dropDatabase = (databaseName, databaseConnection, callback) =>
{
  databaseConnection.query(`DROP DATABASE IF EXISTS ${databaseName}`, (error, result) =>
  {
    if(error) return callback(error.message);

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports.insertQueryWithID = (queryObject, databaseConnection, callback) =>
{
  var keys = Object.keys(queryObject.args).join();
  var values = `"${Object.values(queryObject.args).join('","')}"`;

  databaseConnection.query(`INSERT INTO ${queryObject.databaseName}.${queryObject.tableName} (${keys}) VALUES (${values})`, (error, result) =>
  {
    if(error) return callback(error.message);

    return callback(null, result);
  });
}

/****************************************************************************************************/

module.exports.insertQueryWithUUID = (queryObject, databaseConnection, callback) =>
{
  const uuid = UUIDModule.v4();

  var keys = Object.keys(queryObject.args).join() + ',uuid';
  var values = `"${Object.values(queryObject.args).join('","')}", "${uuid}"`;

  databaseConnection.query(`INSERT INTO ${queryObject.databaseName}.${queryObject.tableName} (${keys}) VALUES (${values})`, (error, result) =>
  {
    if(error) return callback(error.message);

    return callback(null, result);
  });
}

/****************************************************************************************************/

module.exports.selectQuery = (queryObject, databaseConnection, callback) =>
{
  var sqlQuery = `SELECT ${queryObject.args.join()} FROM ${queryObject.databaseName}.${queryObject.tableName}`;
  
  if(Object.keys(queryObject.where).length > 0)
  {
    sqlQuery += ' WHERE ';

    if(queryObject.where.operator != undefined)
    {
      sqlQuery += `${queryObject.where.key} ${queryObject.where.operator} "${queryObject.where.value}"`;

      databaseConnection.query(sqlQuery, (error, result) =>
      {
        if(error) return callback(error.message);

        return callback(null, result);
      });
    }

    else
    {
      getCondition(queryObject.where, (result) =>
      {
        sqlQuery += result;

        databaseConnection.query(sqlQuery, (error, result) =>
        {
          if(error) return callback(error.message);

          return callback(null, result);
        });
      });
    }
  }

  else
  {
    databaseConnection.query(sqlQuery, (error, result) =>
    {
      if(error) return callback(error.message);

      return callback(null, result);
    });
  }
}

/****************************************************************************************************/

module.exports.updateQuery = (queryObject, databaseConnection, callback) =>
{
  var sqlQuery = `UPDATE ${queryObject.databaseName}.${queryObject.tableName} SET `;

  var array = [];

  for(var argument in queryObject.args)
  {
    array.push(`${argument} = "${queryObject.args[argument]}"`);
  }

  sqlQuery += array.join(',');

  if(Object.keys(queryObject.where).length > 0)
  {
    sqlQuery += ' WHERE ';

    if(queryObject.where.operator != undefined)
    {
      sqlQuery += `${object.where.key} ${object.where.operator} "${object.where.value}"`;

      databaseConnection.query(sqlQuery, (error, result) =>
      {
        if(error) return callback(error.message);

        return callback(null, result);
      });
    }

    else
    {
      getCondition(queryObject.where, (result) =>
      {
        sqlQuery += result;

        databaseConnection.query(sqlQuery, (error, result) =>
        {
          if(error) return callback(error.message);

          return callback(null, result);
        });
      });
    }
  }

  else
  {
    databaseConnection.query(sqlQuery, (error, result) =>
    {
      if(error) return callback(error.message);

      return callback(null, result);
    });
  }
}

/****************************************************************************************************/

module.exports.deleteQuery = (queryObject, databaseConnection, callback) =>
{
  var sqlQuery = `DELETE FROM ${queryObject.databaseName}.${queryObject.tableName}`;
  
  if(Object.keys(queryObject.where).length > 0)
  {
    sqlQuery += ' WHERE ';

    if(queryObject.where.operator != undefined)
    {
      sqlQuery += `${object.where.key} ${object.where.operator} "${object.where.value}"`;

      databaseConnection.query(sqlQuery, (error, result) =>
      {
        if(error) return callback(error.message);

        return callback(null, result);
      });
    }

    else
    {
      getCondition(queryObject.where, (result) =>
      {
        sqlQuery += result;

        databaseConnection.query(sqlQuery, (error, result) =>
        {
          if(error) return callback(error.message);

          return callback(null, result);
        });
      });
    }
  }

  else
  {
    databaseConnection.query(sqlQuery, (error, result) =>
    {
      if(error) return callback(error.message);

      return callback(null, result);
    });
  }
}

/****************************************************************************************************/

function getCondition(object, callback)
{
  var array = [];
  var operands = [];

  operands.push(object.condition);

  var x = 0;

  var browseConditionChildren = (currentCondition) =>
  {
    if(currentCondition.condition == undefined) array.push(`${currentCondition.key} ${currentCondition.operator} "${currentCondition.value}"`);

    else
    {
      getCondition(currentCondition, (result) =>
      {
        array.push(result);
      });
    }

    if(object[x += 1] != undefined) browseConditionChildren(object[x]);

    else
    {
      var statement = `(${array.join(` ${operands[operands.length - 1]} `)})`;

      callback(statement);
    }
  }

  browseConditionChildren(object[x]);
}

/****************************************************************************************************/