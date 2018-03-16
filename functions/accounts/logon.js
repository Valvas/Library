'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.authenticateAccountUsingCredentials = (accountEmail, accountPassword, databaseConnector, callback) =>
{
  accountEmail          == undefined ||
  accountPassword       == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  encryption.encryptPassword(accountPassword, (error, encryptedPassword) =>
  {
    if(error != null) callback(error);

    else
    {
      databaseManager.selectQuery(
      {
        'databaseName': params.database.root.label,
        'tableName': params.database.root.tables.accounts,
        'args': { '0': '*' },
        'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'email', 'value': accountEmail }, '1': { 'key': 'password', 'value': encryptedPassword } } } }

      }, databaseConnector, (boolean, accountOrErrorMessage) =>
      {
        if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: accountOrErrorMessage });

        else
        {
          accountOrErrorMessage.length == 0 ?
          callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND }) :
          callback(null, accountOrErrorMessage[0] );
        }
      });
    }
  });
}

/****************************************************************************************************/