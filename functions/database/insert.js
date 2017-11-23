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

module.exports.SQLInsertQuery = function(queryObject, sqlConnector, callback)
{
  let database = queryObject.databaseName;
  let table = queryObject.tableName;

  let keys = Object.keys(queryObject.args).join();
  let values = `"${Object.values(queryObject.args).join('","')}"`;

  let uuid = require('uuid').v4();

  sqlConnector.query(`INSERT INTO ${database}.${table} (${keys},uuid) VALUES (${values},"${uuid}")`, function(err, result)
  {
    err ? callback(false, undefined) : callback(true, uuid);
  });
}