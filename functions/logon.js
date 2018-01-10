'use strict';

var params            = require(`${__root}/json/config`);
var constants         = require(`${__root}/functions/constants`);
var encryption        = require(`${__root}/functions/encryption`);
var databaseManager   = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.checkIfAccountExistsUsingCredentialsProvided = (emailAddress, uncryptedPassword, databaseConnector, callback) =>
{
  encryption.encryptPassword(uncryptedPassword, (encryptedPassword, errorStatus, errorCode) =>
  {
    encryptedPassword == false ? callback(false, errorStatus, errorCode) :

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
        'AND':
        {
          '=':
          {
            '0':
            {
              'key': 'email',
              'value': emailAddress
            },
            '1':
            {
              'key': 'password',
              'value': encryptedPassword
            }
          }
        }
      }
    }, databaseConnector, (boolean, accountOrErrorMessage) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

      else
      {
        accountOrErrorMessage.length == 0 ? callback(false, 406, constants.ACCOUNT_NOT_FOUND) : callback(accountOrErrorMessage[0]);
      }
    });
  });
}

/****************************************************************************************************/