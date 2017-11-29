'use strict';

let constants                  = require('../constants');
let config                     = require('../../json/config');
let SQLSelect                  = require('../database/select');

/****************************************************************************************************/

module.exports.getAccountList = function(SQLConnector, callback)
{
  SQLSelect.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.auth_table,

    "args":
    {
      "0": "*"
    },

    "where":
    {

    }
  }, SQLConnector, (trueOrFalse, rowsOrErrorCode) =>
  {
    callback(trueOrFalse, rowsOrErrorCode);
  });
};

/****************************************************************************************************/

module.exports.getAccountFromUUID = function(accountUUID, SQLConnector, callback)
{
  SQLSelect.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.auth_table,
  
    "args":
    {
      "0": "*"
    },
  
    "where":
    {
      "=":
      {
        "0":
        {
          "key": "uuid",
          "value": accountUUID
        }
      }
    }
  }, SQLConnector, (trueOrFalse, rowsOrErrorCode) =>
  {
    if(trueOrFalse == false) callback(false, constants.SQL_SERVER_ERROR);

    else
    {
      rowsOrErrorCode.length == 0 ? callback(false, constants.ACCOUNT_NOT_FOUND) : callback(true, rowsOrErrorCode[0]);
    }
  });
}

/****************************************************************************************************/