'use strict'

const constants           = require(`${__root}/functions/constants`);
const commonAppsGet       = require(`${__root}/functions/common/apps/get`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.checkAccessToApp = (accountUuid, appName, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'params' });
  if(appName == undefined)            return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'appName' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'databaseConnection' });

  commonAppsGet.checkIfAppExistsFromName(appName, databaseConnection, params, (error, appExists, appData) =>
  {
    if(error != null) return callback(error);

    if(appExists == false) return callback({ status: 404, code: constants.APP_DATA_NOT_FOUND, detail: null });

    databaseManager.selectQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.access,
      args: [ '*' ],
      where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountUuid }, 1: { operator: '=', key: 'app', value: appData.uuid } }
  
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });
  
      if(result.length === 0) return callback(null, false);

      return callback(null, true);
    });
  });
}

/****************************************************************************************************/