'use strict';

var params                = require(`${__root}/json/config`);
var services              = require(`${__root}/json/services`);
var constants             = require(`${__root}/functions/constants`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getUserRightsTowardsService = (serviceName, accountUUID, databaseConnector, callback) =>
{
  if(serviceName == undefined || accountUUID == undefined || databaseConnector == undefined) callback(false, 406, constants.MISSING_DATA_IN_REQUEST);

  else
  {
    !(serviceName in services) ? callback(false, 404, constants.SERVICE_NOT_FOUND) :

    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.rights,
      
      'args': 
      { 
        '0': '*' 
      },
      
      'where':
      {
        'AND':
        {
          '=':
          {
            '0':
            {
              'key': 'account',
              'value': accountUUID
            },

            '1':
            {
              'key': 'service',
              'value': serviceName
            }
          }
        }
      }
    }, databaseConnector, (boolean, rightsOrErrorMessage) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
      
      else
      { 
        rightsOrErrorMessage.length == 0 ? callback(false, 403, constants.UNAUTHORIZED_TO_ACCESS_SERVICE) : callback(rightsOrErrorMessage[0]);
      }
    });
  }
}

/****************************************************************************************************/

module.exports.checkIfUserIsAdmin = (accountUUID, databaseConnector, callback) =>
{
  typeof(accountUUID) != 'string' || databaseConnector == undefined ? callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
  
    'args': 
    { 
      '0': 'is_admin' 
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
  }, databaseConnector, (boolean, adminStatusOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      if(adminStatusOrErrorMessage.length == 0) callback(false, 404, constants.ACCOUNT_NOT_FOUND);
      
      else
      {
        adminStatusOrErrorMessage[0].is_admin == 0 ? callback(false, 403, constants.USER_IS_NOT_ADMIN) : callback(true);
      }
    }
  });
}

/****************************************************************************************************/