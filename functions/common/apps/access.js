'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getAppsAvailableForAccount = (accountID, databaseConnector, callback) =>
{
  accountID             == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.root.label,
    'tableName': params.database.root.tables.access,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'account', 'value' : accountID } } }

  }, databaseConnector, (boolean, appsAccessOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: appsAccessOrErrorMessage });

    else
    {
      appsAccessOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND }) :
      callback(null, appsAccessOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/