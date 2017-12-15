'use strict';

var params                = require(`${__root}/json/config`);
var constants             = require(`${__root}/functions/constants`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getAccountUsingUUID = (accountUUID, databaseConnector, callback) =>
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
  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      accountOrErrorMessage.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) : callback(accountOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

module.exports.getAccountUsingID = (accountID, databaseConnector, callback) =>
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
          'key': 'id',
          'value': accountID
        }
      }
    }
  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      accountOrErrorMessage.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) : callback(accountOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/