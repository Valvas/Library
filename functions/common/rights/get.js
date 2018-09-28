'use strict'

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.checkIfRightsExistsForAccount = (accountUuid, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.rights,
    args: [ '*' ],
    where: { operator: '=', key: 'account', value: accountUuid }
    
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/