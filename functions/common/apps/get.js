'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.getAppsData = (databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'params' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.apps,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var appsData = [];

    for(var x = 0; x < result.length; x++)
    {
      appsData.push({ uuid: result[x].uuid, name: result[x].name, picture: result[x].picture });
    }

    return callback(null, appsData);
  });
}

/****************************************************************************************************/

module.exports.checkIfAppExistsFromName = (appName, databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.apps,
    args: [ '*' ],
    where: { operator: '=', key: 'name', value: appName }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

module.exports.checkIfAccountHasAccessToApp = (appName, accountUuid, databaseConnection, globalParameters, callback) =>
{
  if(globalParameters.database[appName] == undefined) return callback({ status: 404, code: constants.APP_NOT_FOUND, detail: null });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database[appName].label,
    tableName: globalParameters.database[appName].tables.accountsList,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, result.length > 0);
  });
}

/****************************************************************************************************/