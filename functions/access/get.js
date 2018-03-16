'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.getAccountsThatHaveAccessToStorageApp = (databaseConnector, callback) =>
{
  databaseConnector == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.root.label,
    'tableName': params.database.root.tables.access,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'storage', 'value': '1' } } }

  }, databaseConnector, (boolean, accountsOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: accountsOrErrorMessage });

    else
    {
      var x = 0, accounts = {};

      var checkAccountLoop = () =>
      {
        accountsGet.getAccountUsingID(accountsOrErrorMessage[Object.keys(accountsOrErrorMessage)[x]].account, databaseConnector, (error, account) =>
        {
          if(error != null)
          {
            accountsOrErrorMessage[Object.keys(accountsOrErrorMessage)[x += 1]] == undefined ? callback(null, accounts) : checkAccountLoop();
          }

          else
          {
            accounts[x] = {};
            accounts[x] = account;

            accountsOrErrorMessage[Object.keys(accountsOrErrorMessage)[x += 1]] == undefined ? callback(null, accounts) : checkAccountLoop();
          }
        });
      }

      Object.keys(accountsOrErrorMessage).length == 0 ? callback(null, {}) : checkAccountLoop();
    }
  });
}

/****************************************************************************************************/