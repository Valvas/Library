'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.getAccountUsingUUID = (accountUUID, databaseConnector, callback) =>
{
  accountUUID           == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.root.label,
    'tableName': params.database.root.tables.accounts,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'uuid', 'value': accountUUID } } }

  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

    else
    {
      accountOrErrorMessage.length == 0 ? callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND }) : callback(null, accountOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

module.exports.getAccountUsingID = (accountID, databaseConnector, callback) =>
{
  accountID             == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.root.label,
    'tableName': params.database.root.tables.accounts,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': accountID } } }

  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

    else
    {
      accountOrErrorMessage.length == 0 ? callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND }) : callback(null, accountOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

module.exports.getAccountUsingEmail = (accountEmail, databaseConnector, callback) =>
{
  accountEmail          == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.root.label,
    'tableName': params.database.root.tables.accounts,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'email', 'value': accountEmail } } }

  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

    else
    {
      accountOrErrorMessage.length == 0 ? callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND }) : callback(null, accountOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/