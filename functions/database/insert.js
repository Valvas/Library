'use strict';

/*
  queryObject ->
  {
    "databaseName": string,
    "tableName": string,

    "args":
    {
      "[insertColumnName]": "[insertValueToPutInTheColumn]",
      "[insertColumnName]": "[insertValueToPutInTheColumn]",
      "[insertColumnName]": "[insertValueToPutInTheColumn]"
    }
  }

  callback -> [true] + [uuid] : success | [false] + [undefined] : error
*/

/****************************************************************************************************/

/**
 * Perform an insert query to the database.
 * @arg {Object} queryObject - a JSON object with all parameters for the query
 * @arg {Object} SQLConnector - a SQL connector to perform queries to the database
 * @return {Boolean}
 */
module.exports.SQLInsertQuery = function(queryObject, SQLConnector, callback)
{
  let database = queryObject.databaseName;
  let table = queryObject.tableName;

  let keys = Object.keys(queryObject.args).join();
  let values = `"${Object.values(queryObject.args).join('","')}"`;

  let uuid = require('uuid').v4();

  SQLConnector.query(`INSERT INTO ${database}.${table} (${keys},uuid) VALUES (${values},"${uuid}")`, function(err, result)
  {
    err ? callback(false, err.message) : callback(true, uuid);
  });
}

/****************************************************************************************************/