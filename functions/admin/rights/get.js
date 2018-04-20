'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.getAccountRights = (accountID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.administration.label,
    'tableName': params.database.administration.tables.rights,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID } } }

  }, databaseConnector, (boolean, rightsOrErrorMessage) =>
  {
    if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: rightsOrErrorMessage });

    if(rightsOrErrorMessage.length == 0) return callback({ status: 404, code: constants.RIGHTS_NOT_FOUND, detail: null });

    return callback(null, rightsOrErrorMessage[0]);
  });
}

/****************************************************************************************************/