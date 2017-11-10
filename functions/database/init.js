'use strict';

let databases = require(`../../json/database`);

/****************************************************************************************************/

module.exports.createDatabases = function(connector, callback)
{
  let x = 0;
  let array = [];

  let loop = function(databaseName, databaseContent)
  {
    connector.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, function(err, result)
    {
      err ? callback(false, err.message) : array.push(`INFO : database "${databaseName}" created !`);
        
      createAllTables(databaseContent, databaseName, connector, function(result, message)
      {
        result == false ? callback(false, message) : x++;
    
        array.push(message);
    
        Object.keys(databases)[x] == undefined ? callback(true, array.join('\n')) : loop(Object.keys(databases)[x], databases[Object.keys(databases)[x]]);
      });
    });
  };

  Object.keys(databases)[x] == undefined ? callback(true, 'INFO : no database to create !') : loop(Object.keys(databases)[x], databases[Object.keys(databases)[x]]);
}

/****************************************************************************************************/

function createAllTables(database, databaseName, connector, callback)
{
  let x = 0;
  let array = [];

  let loop = function(tableName, tableContent)
  {
    createTable(tableContent, function(result, message)
    {
      result == false ? callback(false, message) : array.push(`[${databaseName}] : table "${tableName}" created !`);

      connector.query(`CREATE TABLE IF NOT EXISTS ${databaseName}.${tableName} (${result})`, function(err, data)
      {
        err != undefined ? callback(false, err.message) : x++;
        
        Object.keys(database)[x] == undefined ? callback(true, array.join('\n')) : loop(Object.keys(database)[x], database[Object.keys(database)[x]]);
      });
    });
  };

  Object.keys(database)[x] == undefined ? callback(true, `INFO : no tables to create for this database !`) : loop(Object.keys(database)[x], database[Object.keys(database)[x]]);
}

/****************************************************************************************************/

function createTable(table, callback)
{
  let x = 0;
  let array = [];

  let loop = function(field, args)
  {
    array.push(`${field} ${args}`);

    x++;

    Object.keys(table)[x] == undefined ? callback(array.join()) : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
  };

  Object.keys(table)[x] == undefined ? callback(true) : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
}

/****************************************************************************************************/