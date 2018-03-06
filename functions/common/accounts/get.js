'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getAccountFromEmail = (accountEmail, databaseConnector, callback) =>
{
  accountEmail        == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.accounts, 
    'args': { '0': '*' },  
    'where': { '=': { '0': { 'key': 'email', 'value': accountEmail } } }

  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: accountOrErrorMessage });

    else if(boolean == true && accountOrErrorMessage.length == 0) callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND });

    else{ callback(null, accountOrErrorMessage[0]); }
  });
}

/****************************************************************************************************/