'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.getAccountAccessForAllApps = (accountUuid, databaseConnection, globalParameters, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.apps,
    args: [ 'uuid', 'name' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    return checkAccessToProvidedApp(result, 0, [], accountUuid, databaseConnection, globalParameters, (error, appsAccess) =>
    {
      return callback(error, appsAccess);
    });
  });
}

/****************************************************************************************************/

function checkAccessToProvidedApp(apps, index, appsAccess, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database[apps[index].name].label,
    tableName: globalParameters.database[apps[index].name].tables.accountsList,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    result.length === 0
    ? appsAccess.push({ name: apps[index].name, hasAccess: false })
    : appsAccess.push({ name: apps[index].name, hasAccess: true });

    if(apps[index += 1] == undefined) return callback(null, appsAccess);

    return checkAccessToProvidedApp(apps, index, appsAccess, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/
