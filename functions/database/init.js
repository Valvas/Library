'use strict';

const databases = require(`${__root}/json/database`);

/****************************************************************************************************/

function createDatabases(pool, callback)
{
  let x = 0;

  const browseDatabases = (databaseName, databaseContent, connection) =>
  {
    connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (error, result) =>
    {
      if(error !== null)
      {
        return callback({ message: error.message });
      }

      console.log(`INFO : database "${databaseName}" created !`);

      createAllTables(databaseContent, databaseName, connection, () =>
      {
        if(Object.keys(databases)[x += 1] === undefined)
        {
          connection.release();
          return callback(null);
        }

        browseDatabases(Object.keys(databases)[x], databases[Object.keys(databases)[x]], connection);
      });
    });
  };

  if(Object.keys(databases)[x] === undefined)
  {
    console.log('INFO : no database to create !');
    return callback(null);
  }

  pool.getConnection((error, connection) =>
  {
    if(error !== null)
    {
      return callback({ message: error.message });
    }

    browseDatabases(Object.keys(databases)[x], databases[Object.keys(databases)[x]], connection);
  });
}

/****************************************************************************************************/

function createAllTables(database, databaseName, connection, callback)
{
  let x = 0;

  const browseTables = (tableName, tableContent) =>
  {
    buildTable(tableContent, (result) =>
    {
      if(result === false)
      {
        console.log(`[${databaseName}] : Error - cannot create a table "${tableName}" with no columns !`);

        if(Object.keys(database)[x += 1] === undefined)
        {
          return callback(null);
        }

        return browseTables(Object.keys(database)[x], database[Object.keys(database)[x]]);
      }

      connection.query(`CREATE TABLE IF NOT EXISTS ${databaseName}.${tableName} (${result})`, (error, data) =>
      {
        error !== null
        ? console.log(`[${databaseName}] : ${error.message} `)
        : console.log(`[${databaseName}] : table "${tableName}" created !`);

        if(Object.keys(database)[x += 1] === undefined)
        {
          return callback(null);
        }

        browseTables(Object.keys(database)[x], database[Object.keys(database)[x]]);
      });
    });
  };

  if(Object.keys(database)[x] === undefined)
  {
    console.log(`INFO : no tables to create for this database !`);

    return callback(null);
  }

  browseTables(Object.keys(database)[x], database[Object.keys(database)[x]]);
}

/****************************************************************************************************/

function buildTable(table, callback)
{
  let x = 0;
  let array = [];

  const loop = (field, args) =>
  {
    array.push(`${field} ${args}`);

    Object.keys(table)[x += 1] === undefined
    ? callback(array.join())
    : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
  };

  Object.keys(table)[x] === undefined
  ? callback(true)
  : loop(Object.keys(table)[x], table[Object.keys(table)[x]]);
}

/****************************************************************************************************/

module.exports =
{
  createDatabases: createDatabases
}

/****************************************************************************************************/
