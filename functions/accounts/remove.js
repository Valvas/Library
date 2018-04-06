'use strict'

const params                      = require(`${__root}/json/params`);
const constants                   = require(`${__root}/functions/constants`);
const accountsGet                 = require(`${__root}/functions/accounts/get`);
const adminAppAccountsRemove      = require(`${__root}/functions/admin/accounts/remove`);
const storageAppAccountsRemove    = require(`${__root}/functions/storage/accounts/remove`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

//Starts by calling functions in each application that remove the account everywhere in the application
//Then remove completely the account from the database

module.exports.removeAccount = (accountID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    storageAppAccountsRemove.removeAccount(accountID, databaseConnector, (error) =>
    {
      error != null ? callback(error) :

      adminAppAccountsRemove.removeAccount(accountID, databaseConnector, (error) =>
      {
        error != null ? callback(error) :

        databaseManager.deleteQuery(
        {
          'databaseName': params.database.root.label,
          'tableName': params.database.root.tables.access,
          'where': { '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID } } }
    
        }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
        {
          boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: deletedRowsOrErrorMessage }) :
    
          databaseManager.deleteQuery(
          {
            'databaseName': params.database.root.label,
            'tableName': params.database.root.tables.accounts,
            'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': accountID } } }
      
          }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
          {
            boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: deletedRowsOrErrorMessage }) :
      
            callback(null);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/