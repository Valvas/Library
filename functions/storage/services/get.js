'use strict'

const params                      = require(`${__root}/json/params`);
const constants                   = require(`${__root}/functions/constants`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const commonAccountsGet           = require(`${__root}/functions/common/accounts/get`);
const storageAppExtensionsGet     = require(`${__root}/functions/storage/extensions/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const oldDatabaseManager  = require(`${__root}/functions/database/MySQLv2`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

var storageAppServicesGet = module.exports = {};

/****************************************************************************************************/

storageAppServicesGet.getServicesData = (databaseConnection, params, callback) =>
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
        where: { operator: '=', key: 'service_uuid', value: services[x].uuid }
    
      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        servicesObject[services[x].uuid].amountOfFiles = 0;
        servicesObject[services[x].uuid].amountOfFolders = 0;

        for(var i = 0; i < result.length; i++)
        {
          result[x].is_directory
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

storageAppServicesGet.getServiceUsingUUID = (serviceUuid, databaseConnection, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    return callback(null, result[0]);
  });
}

/****************************************************************************************************/

storageAppServicesGet.checkIfServiceExists = (serviceUuid, databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, false);

    storageAppExtensionsGet.getExtensionsForService(serviceUuid, databaseConnection, params, (error, serviceExtensions) =>
    {
      if(error != null) return callback(error);

      var serviceData = {};

      serviceData.serviceUuid = result[0].uuid;
      serviceData.serviceName = result[0].name;
      serviceData.maxFileSize = result[0].file_size_limit;
      serviceData.authorizedExtensions = serviceExtensions;

      return callback(null, true, serviceData);
    });
  });
}

/****************************************************************************************************/

storageAppServicesGet.getServiceUsingName = (serviceName, databaseConnection, params, callback) =>
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

module.exports.getAmountOfFilesFromService = (serviceID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  oldDatabaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },  
    'where': { '0': { 'operator': '=', '0': { 'key': 'service', 'value': serviceID } } }

  }, databaseConnector, (boolean, filesOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: filesOrErrorMessage });
    
    else
    {
      var x = 0;
      var amountOfFiles = 0;

      var browseFileLoop = () =>
      {
        if(filesOrErrorMessage[x].deleted == 0) amountOfFiles += 1;
        
        filesOrErrorMessage[x += 1] == undefined ? callback(null, amountOfFiles) : browseFileLoop();
      }

      filesOrErrorMessage.length == 0 ? callback(null, 0) : browseFileLoop();
    }
  });
}

/****************************************************************************************************/

module.exports.getMembersFromService = (serviceUuid, databaseConnector, callback) =>
{
  serviceUuid         == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.rights,
    args: [ '*' ],
    where: { operator: '=', key: 'service', value: serviceUuid }

  }, databaseConnector, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    else if(result.length == 0) return callback(null, {});

    var x = 0, members = {};

    var browseMembers = () =>
    {
      members[result[x].account] = result[x];

      result[x += 1] != undefined ? browseMembers() : callback(null, members);
    }

    browseMembers();
  });
}

/****************************************************************************************************/

module.exports.getAmountOfMembersFromService = (serviceID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  oldDatabaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.rights,
    'args': { '0': 'id' },  
    'where': { '0': { 'operator': '=', '0': { 'key': 'service', 'value': serviceID } } }

  }, databaseConnector, (boolean, membersIDsOrErrorMessage) =>
  {
    boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: membersIDsOrErrorMessage }) : callback(null, Object.keys(membersIDsOrErrorMessage).length);
  });
}

/****************************************************************************************************/
// GET THE MAXIMUM SIZE OF FILES THAT CAN BE UPLOADED FOR A SERVICE
/****************************************************************************************************/

module.exports.getFileMaxSize = (serviceUuid, databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ 'file_size_limit' ],
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback(error);

    if(result.length == 0) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    return callback(null, result[0].file_size_limit);
  });
}

/****************************************************************************************************/
// WHEN A USER TRIES TO ACCESS A SERVICE
/****************************************************************************************************/

module.exports.accessService = (serviceUuid, accountUuid, databaseConnection, params, callback) =>
{
  checkIfServiceExists(serviceUuid, accountUuid, databaseConnection, params, callback);
}

/****************************************************************************************************/

function checkIfServiceExists(serviceUuid, accountUuid, databaseConnection, params, callback)
{
  storageAppServicesGet.getServiceUsingUUID(serviceUuid, databaseConnection, (error, service) =>
  {
    if(error != null) return callback(error);

    checkIfAccountExists(service, accountUuid, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkIfAccountExists(service, accountUuid, databaseConnection, params, callback)
{
  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    getCurrentUserRightsOnService(service, accountData, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getCurrentUserRightsOnService(service, accountData, databaseConnection, params, callback)
{
  storageAppServicesRights.getRightsTowardsService(service.uuid, accountData.uuid, databaseConnection, params, (error, rights) =>
  {
    if(error != null) return callback(error);

    getCurrentServiceFiles(service, accountData, rights, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getCurrentServiceFiles(service, accountData, rights, databaseConnection, params, callback)
{
  storageAppFilesGet.getFilesFromService(service.uuid, null, databaseConnection, params, (error, files) =>
  {
    if(error != null) return callback(error);

    return callback(null, service, rights, files);
  });
}

/****************************************************************************************************/
// GET AUTHORIZED EXTENSIONS FOR A SERVICE
/****************************************************************************************************/

module.exports.getAuthorizedExtensionsForService = (serviceUuid, databaseConnection, params, callback) =>
{
  getExtensionsUuidAuthorizedForCurrentService(serviceUuid, databaseConnection, params, (error, serviceExtensions, allExtensions) =>
  {
    if(error != null) return callback(error);

    return callback(null, serviceExtensions, allExtensions);
  });
}

/****************************************************************************************************/

function getExtensionsUuidAuthorizedForCurrentService(serviceUuid, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.extensionsForService,
    args: [ 'extension_uuid' ],
    where: { operator: '=', key: 'service_uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var extensionsUuid = [];

    for(var x = 0; x < result.length; x++)
    {
      extensionsUuid.push(result[x].extension_uuid);
    }

    getValueForEachExtensionFromItsUuid(serviceUuid, extensionsUuid, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getValueForEachExtensionFromItsUuid(serviceUuid, extensionsUuid, databaseConnection, params, callback)
{
  if(extensionsUuid.length === 0) return callback(null, []);

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.extensions,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, []);

    var allExtensions = [], serviceExtensions = [];

    for(var x = 0; x < result.length; x++)
    {
      allExtensions.push({ extensionUuid: result[x].uuid, extensionValue: result[x].value });

      if(extensionsUuid.includes(result[x].uuid)) serviceExtensions.push({ uuid: result[x].uuid, value: result[x].value });
    }

    return callback(null, serviceExtensions, allExtensions);
  });
}

/****************************************************************************************************/

module.exports.getFilesFromService = (serviceUuid, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(serviceUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });
  
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'service_uuid', value: serviceUuid }, 1: { operator: '=', key: 'is_deleted', value: '0' }, 2: { operator: '=', key: 'is_directory', value: '0' } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var serviceFiles = [];

    for(var x = 0; x < result.length; x++)
    {
      serviceFiles.push({ fileUuid: result[x].uuid, fileName: result[x].name, parentFolder: result[x].parent_folder });
    }

    return callback(null, serviceFiles);
  });
}

/****************************************************************************************************/