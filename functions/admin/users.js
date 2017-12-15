'use strict';

var params                     = require(`${__root}/json/config`);
var constants                  = require(`${__root}/functions/constants`);
var databaseManager            = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getAccountList = (databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,

    'args':
    {
      '0': '*'
    },

    'where':
    {

    }
  }, databaseConnector, (boolean, accountsOrErrorCode) =>
  {
    boolean ? callback(accountsOrErrorCode) : callback(false, 500, constants.SQL_SERVER_ERROR);
  });
};

/****************************************************************************************************/

module.exports.getAccountFromUUID = (accountUUID, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
  
    'args':
    {
      '0': '*'
    },
  
    'where':
    {
      '=':
      {
        '0':
        {
          'key': 'uuid',
          'value': accountUUID
        }
      }
    }
  }, databaseConnector, (boolean, accountOrErrorCode) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      accountOrErrorCode.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) : callback(accountOrErrorCode[0]);
    }
  });
}

/****************************************************************************************************/