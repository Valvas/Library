'use strict'

const constants                   = require(`${__root}/functions/constants`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const storageAppAdminGet          = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

function getServicesData(databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, services) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var x = 0;
    var servicesObject = {};

    var loop = () =>
    {
      servicesObject[services[x].uuid] = {};
      servicesObject[services[x].uuid].name = services[x].name;
      servicesObject[services[x].uuid].fileLimit = services[x].file_size_limit;

      databaseManager.selectQuery(
      {
        databaseName: params.database.storage.label,
        tableName: params.database.storage.tables.serviceElements,
        args: [ '*' ],
        where: { condition: 'AND', 0: { operator: '=', key: 'service_uuid', value: services[x].uuid }, 1: { operator: '=', key: 'is_deleted', value: 0 } }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        servicesObject[services[x].uuid].amountOfFiles = 0;
        servicesObject[services[x].uuid].amountOfFolders = 0;

        for(var i = 0; i < result.length; i++)
        {
          result[i].is_directory
          ? servicesObject[services[x].uuid].amountOfFolders += 1
          : servicesObject[services[x].uuid].amountOfFiles += 1;
        }

        services[x += 1] == undefined ? callback(null, servicesObject) : loop();
      });
    }

    services.length == 0 ? callback(null, servicesObject) : loop();
  });
}

/****************************************************************************************************/

function checkIfServiceExistsFromUuid(serviceUuid, databaseConnection, params, callback)
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    var serviceData = {};

    serviceData.serviceUuid   = result[0].uuid;
    serviceData.serviceName   = result[0].name;
    serviceData.maxFileSize   = result[0].file_size_limit;

    serviceData.authorizedExtensions = [];

    databaseManager.selectQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.serviceExtensions,
      args: [ '*' ],
      where: { operator: '=', key: 'service_uuid', value: serviceUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      for(var x = 0; x < result.length; x++)
      {
        serviceData.authorizedExtensions.push(result[x].extension_uuid);
      }

      return callback(null, true, serviceData);
    });
  });
}

/****************************************************************************************************/

function checkIfServiceExistsFromName(serviceName, databaseConnection, params, callback)
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(serviceName == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceName' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'name', value: serviceName }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/
// WHEN A USER TRIES TO ACCESS A SERVICE
/****************************************************************************************************/

function accessService(serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  checkIfServiceExistsFromUuid(serviceUuid, databaseConnection, globalParameters, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, serviceRights) =>
    {
      if(error != null) return callback(error);

      storageAppFilesGet.getFilesFromService(serviceUuid, null, databaseConnection, globalParameters, (error, filesAndFolders) =>
      {
        if(error != null) return callback(error);

        return callback(null, serviceData, serviceRights, filesAndFolders);
      });
    });
  });
}

/****************************************************************************************************/
// GET AUTHORIZED EXTENSIONS FOR A SERVICE
/****************************************************************************************************/

function getAuthorizedExtensionsForService(serviceUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.extensions,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback({ status: 500, code: constants.NO_EXTENSIONS_FOUND, detail: null });

    var allExtensions = {};

    for(var x = 0; x < result.length; x++)
    {
      allExtensions[result[x].uuid] = result[x].value;
    }

    databaseManager.selectQuery(
    {
      databaseName: globalParameters.database.storage.label,
      tableName: globalParameters.database.storage.tables.serviceExtensions,
      args: [ '*' ],
      where: { operator: '=', key: 'service_uuid', value: serviceUuid }

    }, databaseConnection, (error, serviceExtensions) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      if(serviceExtensions.length === 0) return callback({ status: 500, code: constants.NO_EXTENSIONS_FOUND_FOR_SERVICE, detail: null });

      var authorizedExtensions = {};

      for(var x = 0; x < serviceExtensions.length; x++)
      {
        authorizedExtensions[serviceExtensions[x].extension_uuid] = allExtensions[serviceExtensions[x].extension_uuid];
      }

      return callback(null, authorizedExtensions);
    });
  });
}

/****************************************************************************************************/
// GET ALL EXTENSIONS
/****************************************************************************************************/

function getAllExtensions(databaseConnection, globalParameters, callback)
{
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Global parameters are missing from the request' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Database connection is missing from the request' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.extensions,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    var allExtensions = {};

    result.forEach((element) =>
    {
      allExtensions[element.uuid] = element.value;
    });

    return callback(null, allExtensions);
  });
}

/****************************************************************************************************/
// GET ALL FILES FOR SERVERS
/****************************************************************************************************/

function getFilesFromService(serviceUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'service_uuid', value: serviceUuid }, 1: { operator: '=', key: 'is_directory', value: 0 }, 2: { operator: '=', key: 'is_deleted', value: 0 } },
    order: [ { column: 'name', asc: true } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, result);
  });
}

/****************************************************************************************************/

module.exports =
{
  accessService: accessService,
  getServicesData: getServicesData,
  getAllExtensions: getAllExtensions,
  getFilesFromService: getFilesFromService,
  checkIfServiceExistsFromName: checkIfServiceExistsFromName,
  checkIfServiceExistsFromUuid: checkIfServiceExistsFromUuid,
  getAuthorizedExtensionsForService: getAuthorizedExtensionsForService
}

/****************************************************************************************************/
