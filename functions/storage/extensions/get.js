'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.getAllExtensions = (databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.extensions,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null, result);
  });
}

/****************************************************************************************************/

module.exports.getExtensionFromUuid = (extensionUuid, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(extensionUuid == undefined)      return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'extensionUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.extensions,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: extensionUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

module.exports.getExtensionsForService = (serviceUuid, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceExtensions,
    args: [ '*' ],
    where: { operator: '=', key: 'service_uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var extensions = [];

    for(var x = 0; x < result.length; x++)
    {
      extensions.push(result[x].extension_uuid);
    }

    return callback(null, extensions);
  });
}

/****************************************************************************************************/