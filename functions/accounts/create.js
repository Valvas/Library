'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountEmail          = require(`${__root}/functions/email/account`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.createAccount = (account, databaseConnector, callback) =>
{
  account.email         == undefined ||
  account.lastname      == undefined ||
  account.firstname     == undefined ||
  account.suspended     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  encryption.getRandomPassword((error, passwords) =>
  {
    if(error != null) callback(error);

    else
    {
      databaseManager.insertQuery(
      {
        'databaseName': params.database.root.label,
        'tableName': params.database.root.tables.accounts,
        'uuid': true,
        'args': { 'email': account.email, 'lastname': account.lastname, 'firstname': account.firstname, 'password': passwords.encrypted, 'suspended': account.suspended ? 1 : 0, }

      }, databaseConnector, (boolean, accountIDOrErrorMessage) =>
      {
        if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

        else
        {
          console.log(`[ACCOUNTS] - Warning - password for account "${account.email}" is "${passwords.clear}"`);
          callback(null);
        }
      });
    }
  });
}

/****************************************************************************************************/