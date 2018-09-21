'use strict'

const params                      = require(`${__root}/json/params`);
const constants                   = require(`${__root}/functions/constants`);
const accountsGet                 = require(`${__root}/functions/accounts/get`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const oldDatabaseManager  = require(`${__root}/functions/database/MySQLv2`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

var storageAppServicesGet = module.exports = {};

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

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

storageAppServicesGet.getServiceUsingName = (serviceName, databaseConnector, callback) =>
{
  serviceName         == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'name', value: serviceName }

  }, databaseConnector, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    return callback(null, result[0]);
  });
}

/****************************************************************************************************/

storageAppServicesGet.getAllServices = (databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: [ '*' ],
    where: {  }

  }, databaseConnector, (error, services) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var x = 0;
    var servicesObject = {};

    var loop = () =>
    {
      servicesObject[services[x].uuid] = {};
      servicesObject[services[x].uuid].name = services[x].name;
      servicesObject[services[x].uuid].fileLimit = services[x].file_size_limit;

      services[x += 1] == undefined ? callback(null, servicesObject) : loop();
    }

    services.length == 0 ? callback(null, servicesObject) : loop();
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

module.exports.accessService = (serviceUuid, accountId, databaseConnection, params, callback) =>
{
  checkIfServiceExists(serviceUuid, accountId, databaseConnection, params, callback);
}

/****************************************************************************************************/

function checkIfServiceExists(serviceUuid, accountId, databaseConnection, params, callback)
{
  storageAppServicesGet.getServiceUsingUUID(serviceUuid, databaseConnection, (error, service) =>
  {
    if(error != null) return callback(error);

    checkIfAccountExists(service, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkIfAccountExists(service, accountId, databaseConnection, params, callback)
{
  accountsGet.getAccountUsingID(accountId, databaseConnection, (error, account) =>
  {
    if(error != null) return callback(error);

    getCurrentUserRightsOnService(service, account, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getCurrentUserRightsOnService(service, account, databaseConnection, params, callback)
{
  storageAppServicesRights.getRightsTowardsService(service.uuid, account.id, databaseConnection, params, (error, rights) =>
  {
    if(error != null) return callback(error);

    getCurrentServiceFiles(service, account, rights, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getCurrentServiceFiles(service, account, rights, databaseConnection, params, callback)
{
  storageAppFilesGet.getFilesFromService(service.uuid, account.id, null, databaseConnection, params, (error, files) =>
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