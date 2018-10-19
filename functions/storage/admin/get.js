'use strict'

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesGet = require(`${__root}/functions/storage/services/get`);

const currentModuleFunctions = module.exports = {};

/****************************************************************************************************/

module.exports.getAccountAdminLevel = (accountUuid, databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.accountAdminLevel,
    args: [ '*' ],
    where: { operator: '=', key: 'account', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length > 0) return callback(null, result[0].level);

    databaseManager.insertQuery(
    {
      databaseName: params.database.storage.label,
      tableName: params.database.storage.tables.accountAdminLevel,
      args: { account: accountUuid, level: 0 }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null, 0);
    });
  });
}

/****************************************************************************************************/

module.exports.getAdminRightsForAllLevels = (databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.adminLevels,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, {});

    var rightsData = {};

    for(var x = 0; x < result.length; x++)
    {
      rightsData[result[x].level] = {};

      rightsData[result[x].level].createServices = result[x].create_services === 1;
      rightsData[result[x].level].modifyServices = result[x].modify_services === 1;
      rightsData[result[x].level].removeServices = result[x].remove_services === 1;
    }

    return callback(null, rightsData);
  });
}

/****************************************************************************************************/

module.exports.getAdminRightsForProvidedLevel = (adminLevel, databaseConnection, params, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.adminLevels,
    args: [ '*' ],
    where: { operator: '=', key: 'level', value: parseInt(adminLevel) }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    var rights = [];

    rights.push({ 'accessService': result[0].access_service  === 1 });
    rights.push({ 'commentFiles': result[0].comment_files  === 1 });
    rights.push({ 'uploadFiles': result[0].upload_files  === 1 });
    rights.push({ 'createFolders': result[0].create_folders  === 1 });
    rights.push({ 'renameFolders': result[0].rename_folders  === 1 });
    rights.push({ 'moveFiles': result[0].move_files  === 1 });
    rights.push({ 'downloadFiles': result[0].download_files  === 1 });
    rights.push({ 'restoreFiles': result[0].restore_files  === 1 });
    rights.push({ 'removeFolders': result[0].remove_folders  === 1 });
    rights.push({ 'removeFiles': result[0].remove_files  === 1 });
    rights.push({ 'createServices': result[0].create_services  === 1 });
    rights.push({ 'modifyServices': result[0].modify_services  === 1 });
    rights.push({ 'removeServices': result[0].remove_services  === 1 });

    return callback(null, true, rights);
  });
}

/****************************************************************************************************/

currentModuleFunctions.getAccountAdminRights = (accountUuid, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.admin,
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

currentModuleFunctions.getServicesDetailForConsultation = (databaseConnectionPool, callback) =>
{
  storageAppServicesGet.getAllServices(databaseConnectionPool, (error, services) =>
  {
    if(error != null) return callback(error);

    var x = 0;

    var browseServices = () =>
    {
      storageAppServicesGet.getMembersFromService(Object.keys(services)[x], databaseConnectionPool, (error, members) =>
      {
        if(error != null) return callback(error);

        services[Object.keys(services)[x]].members = {};
        services[Object.keys(services)[x]].members = members;

        if(Object.keys(services)[x += 1] == null) return callback(null, services);

        browseServices();
      });
    }

    if(Object.keys(services).length == 0) return callback(null, services);

    browseServices();
  });
}

/****************************************************************************************************/
// GET MEMBERS OF A SERVICE
/****************************************************************************************************/

currentModuleFunctions.getServiceMembers = (serviceUuid, accountId, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountId == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  currentModuleFunctions.getAccountAdminRights(accountId, databaseConnection, params, (error, rights) =>
  {
    if(error != null) return callback(error);

    if(rights.add_services_rights === 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_CONSULT_SERVICES_RIGHTS, detail: null });

    storageAppServicesGet.checkIfServiceExists(serviceUuid, databaseConnection, params, (error, serviceExists, serviceData) =>
    {
      if(error != null) return callback(error);

      if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

      getAccountsThatHaveRightsOnCurrentService(serviceUuid, databaseConnection, params, (error, members) =>
      {
        return callback(error, members);
      });
    });
  });
}

/****************************************************************************************************/

function getAccountsThatHaveRightsOnCurrentService(serviceUuid, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.rights,
    args: [ '*' ],
    where: { operator: '=', key: 'service', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, []);

    browseServiceMembers(serviceUuid, result, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function browseServiceMembers(serviceUuid, serviceMembers, databaseConnection, params, callback)
{
  var index = 0, members = [];

  var browseAccounts = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromId(serviceMembers[index].account, databaseConnection, params, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

      members[index] = {};
      members[index].accountUuid        = accountData.uuid;
      members[index].accountEmail       = accountData.email;
      members[index].accountLastname    = accountData.lastname;
      members[index].accountFirstname   = accountData.firstname;
      members[index].uploadFiles        = serviceMembers.upload_files === 1;
      members[index].removeFiles        = serviceMembers.remove_files === 1;
      members[index].commentFiles       = serviceMembers.post_comments === 1;
      members[index].restoreFiles       = serviceMembers.restore_files === 1;
      members[index].downloadFiles      = serviceMembers.download_files === 1;
      members[index].createFolders      = serviceMembers.create_folders === 1;
      members[index].renameFolders      = serviceMembers.rename_folders === 1;
      members[index].removeFolders      = serviceMembers.remove_folders === 1;

      if(serviceMembers[index += 1] == undefined) return callback(null, members);

      browseAccounts();
    });
  }

  browseAccounts();
}

/****************************************************************************************************/
// GET ACCOUNTS THAT CAN BE ADDED TO PROVIDED SERVICE
/****************************************************************************************************/

currentModuleFunctions.getAccountsThatCanBeAddedToService = (serviceUuid, accountId, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountId == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  currentModuleFunctions.getAccountAdminRights(accountId, databaseConnection, params, (error, rights) =>
  {
    if(error != null) return callback(error);

    if(rights.add_services_rights === 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_CONSULT_SERVICES_RIGHTS, detail: null });

    storageAppServicesGet.checkIfServiceExists(serviceUuid, databaseConnection, params, (error, serviceExists, serviceData) =>
    {
      if(error != null) return callback(error);

      if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

      getAccountsThatHaveAccessToTheApp(serviceUuid, databaseConnection, params, (error, accounts) =>
      {
        return callback(error, accounts);
      });
    });
  });
}

/****************************************************************************************************/

function getAccountsThatHaveAccessToTheApp(serviceUuid, databaseConnection, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.applications,
    args: [ '*' ],
    where: { operator: '=', key: 'name', value: 'storage' }

  }, databaseConnection, (error, storageAppData) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(storageAppData.length == 0) return callback({ status: 404, code: constants.APP_NOT_FOUND, detail: null });

    databaseManager.selectQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.access,
      args: [ '*' ],
      where: { operator: '=', key: 'app', value: storageAppData[0].uuid }
  
    }, databaseConnection, (error, appMembers) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      if(appMembers.length == 0) return callback(null, []);

      browseAccountsToGetThoseWithNoRightsOnProvidedService(serviceUuid, appMembers, databaseConnection, params, callback);
    });
  });
}

/****************************************************************************************************/

function browseAccountsToGetThoseWithNoRightsOnProvidedService(serviceUuid, appMembers, databaseConnection, params, callback)
{
  var index = 0, accounts = [];

  var browseAccounts = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(appMembers[index].account, databaseConnection, params, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

      databaseManager.selectQuery(
      {
        databaseName: params.database.storage.label,
        tableName: params.database.storage.tables.rights,
        args: [ '*' ],
        where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountData.id }, 1: { operator: '=', key: 'service', value: serviceUuid } }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        if(result.length > 0)
        {
          if(appMembers[index += 1] == undefined) return callback(null, accounts);

          browseAccounts();
        }

        else
        {
          commonAccountsGet.checkIfAccountExistsFromUuid(appMembers[index].account, databaseConnection, params, (error, accountExists, accountData) =>
          {
            if(error != null) return callback(error);

            if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

            accounts.push(accountData);

            if(appMembers[index += 1] == undefined) return callback(null, accounts);

            browseAccounts();
          });
        }
      });
    });
  }

  browseAccounts();
}

/****************************************************************************************************/