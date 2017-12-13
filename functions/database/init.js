'use strict';

let databases = require(`../../json/database`);

/****************************************************************************************************/

module.exports.createDatabases = (connector, callback) =>
{
  let x = 0;

  let loop = (databaseName, databaseContent) =>
  {
    connector.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (err, result) =>
    {
      if(err)
      {
        console.log(err.message);
        callback();
      }

      else
      {
        console.log(`INFO : database "${databaseName}" created !`);

        createAllTables(databaseContent, databaseName, connector, () =>
        {      
          Object.keys(databases)[x += 1] == undefined ? callback() : loop(Object.keys(databases)[x], databases[Object.keys(databases)[x]]);
        });
      }
    });
  };

  if(Object.keys(databases)[x] == undefined)
  {
    console.log('INFO : no database to create !');
    callback()
  }
  
  else
  {
    loop(Object.keys(databases)[x], databases[Object.keys(databases)[x]]);
  }
}

/****************************************************************************************************/

function createAllTables(database, databaseName, connector, callback)
{
  let x = 0;

  let loop = (tableName, tableContent) =>
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
        connector.query(`CREATE TABLE IF NOT EXISTS ${databaseName}.${tableName} (${result})`, function(err, data)
        {
          err ? console.log(`[${databaseName}] : ${err.message} `) : console.log(`[${databaseName}] : table "${tableName}" created !`);;
            
          Object.keys(database)[x += 1] == undefined ? callback() : loop(Object.keys(database)[x], database[Object.keys(database)[x]]);
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
  let x = 0;
  let array = [];

  let loop = (field, args) =>
  {
    array.push(`${field} ${args}`);

    Object.keys(table)[x += 1] == undefined ? callback(array.join()) : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
  };

  Object.keys(table)[x] == undefined ? callback(true) : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
}

/****************************************************************************************************/