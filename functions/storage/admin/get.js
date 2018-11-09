'use strict'

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

function checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.globalAdministration,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }
    
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, result.length > 0);
  });
}

/****************************************************************************************************/

function getServicesThatAccountIsAdmin(accountUuid, databaseConnection, globalParameters, callback)
{
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceRights,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'account_uuid', value: accountUuid }, 1: { operator: '=', key: 'is_admin', value: 1 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    var adminOnServices = [];

    for(var x = 0; x < result.length; x++) adminOnServices.push(result[x].service_uuid);

    return callback(null, adminOnServices);
  });
}

/****************************************************************************************************/

function checkIfAccountIsAdminOnService(accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceRights,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'account_uuid', value: accountUuid }, 1: { operator: '=', key: 'service_uuid', value: serviceUuid }, 2: { operator: '=', key: 'is_admin', value: 1 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, result.length > 0);
  });
}

/****************************************************************************************************/

module.exports =
{
  checkIfAccountIsAdmin: checkIfAccountIsAdmin,
  getServicesThatAccountIsAdmin: getServicesThatAccountIsAdmin,
  checkIfAccountIsAdminOnService: checkIfAccountIsAdminOnService
}

/****************************************************************************************************/