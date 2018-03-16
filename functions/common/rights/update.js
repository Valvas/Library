'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.updateAppsAccessRights = (account, databaseConnector, callback) =>
{
  account.id          == undefined ||
  account.admin       == undefined ||
  account.disease     == undefined ||
  account.storage     == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.updateQuery(
  {
    'databaseName': params.database.root.label,
    'tableName': params.database.root.tables.access,
    'args': { 'admin': account.admin ? 1 : 0, 'disease': account.disease ? 1 : 0, 'storage': account.storage ? 1 : 0 },
    'where': { '0': { 'operator': '=', '0': { 'key': 'account', 'value' : account.id } } }

  }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
  {
    boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR }) : callback(null);
  });
}

/****************************************************************************************************/