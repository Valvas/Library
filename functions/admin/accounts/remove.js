'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.removeAccount = (accountID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.deleteQuery(
  {
    'databaseName': params.database.administration.label,
    'tableName': params.database.administration.tables.rights,
    'where': { '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID } } }

  }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
  {
    boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: deletedRowsOrErrorMessage }) :

    callback(null);
  });
}

/****************************************************************************************************/