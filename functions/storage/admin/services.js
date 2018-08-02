'use strict'

const fs                    = require('fs');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const foldersCreate         = require(`${__root}/functions/folders/create`);
const storageAppAdminGet    = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesGet = require(`${__root}/functions/storage/services/get`);
const storageAppFilesRemove = require(`${__root}/functions/storage/files/remove`);
const errorReportsCreate    = require(`${__root}/functions/common/errors/create`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const oldDatabaseManager    = require(`${__root}/functions/database/MySQLv2`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.createService = (serviceName, maxFileSize, authorizedExtensions, accountID, databaseConnector, params, callback) =>
{
  serviceName = serviceName.toLowerCase();

  if(maxFileSize < params.init.minFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_LOW, detail: null });

  if(maxFileSize > params.init.maxFileSize) return callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_HIGH, detail: null });

  if(Object.keys(authorizedExtensions).length == 0) return callback({ status: 406, code: constants.ONE_EXTENSION_REQUIRED, detail: null });

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    if(error != null) return callback(error);

    storageAppAdminGet.getAccountAdminRights(accountID, databaseConnector, (error, rights) =>
    {
      if(error != null) return callback(error);

      if(rights.create_services == 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_CREATE_SERVICES });

      storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
      {
        if(error != null && error.status != 404) return callback(error);

        if(error == null) return callback({ status: 406, code: constants.SERVICE_NAME_ALREADY_IN_USE, detail: null });

        databaseManager.insertQueryWithUUID(
        {
          databaseName: params.database.storage.label,
          tableName: params.database.storage.tables.services,
          args: { name: serviceName, file_size_limit: maxFileSize }
          
        }, databaseConnector, (error, result) =>
        {
          if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

          databaseManager.selectQuery(
          {
            databaseName: params.database.storage.label,
            tableName: params.database.storage.tables.services,
            args: [ 'uuid' ],
            where: { operator: '=', key: 'name', value: serviceName }

          }, databaseConnector, (error, service) =>
          {
            if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

            var extensionsIterator = 0;

            var extensionsBrowser = () =>
            {
              databaseManager.selectQuery(
              {
                databaseName: params.database.storage.label,
                tableName: params.database.storage.tables.extensions,
                args: [ 'uuid' ],
                where: { operator: '=', key: 'uuid', value: authorizedExtensions[Object.keys(authorizedExtensions)[extensionsIterator]] }

              }, databaseConnector, (error, extension) =>
              {
                if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

                databaseManager.insertQueryWithUUID(
                {
                  databaseName: params.database.storage.label,
                  tableName: params.database.storage.tables.extensionsForService,
                  args: { extension_uuid: extension[0].uuid, service_uuid: service[0].uuid }

                }, databaseConnector, (error, result) =>
                {
                  if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

                  if(Object.keys(authorizedExtensions)[extensionsIterator += 1] != undefined) extensionsBrowser();

                  else
                  {
                    createStorageFolder(service[0].uuid, databaseConnector, params, (error) =>
                    {
                      if(error != null) return callback(error);

                      createLogsFolder(service[0].uuid, databaseConnector, params, (error) =>
                      {
                        if(error != null) return callback(error);

                        return callback(null);
                      });
                    });
                  }
                });
              });
            }

            extensionsBrowser();
          });
        });
      });
    });
  });
}

/****************************************************************************************************/

module.exports.addMembersToService = (serviceUuid, members, accountID, databaseConnector, params, callback) =>
{
  serviceUuid         == undefined ||
  members             == undefined ||
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    storageAppAdminGet.getAccountAdminRights(accountID, databaseConnector, (error, rights) =>
    {
      if(error != null) callback(error);

      else
      {
        if(rights.add_services_rights == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_MANAGE_USER_RIGHTS });

        else
        {
          var x = 0;

          var browseMembersList = () =>
          {
            accountsGet.getAccountUsingID(members[Object.keys(members)[x]].id, databaseConnector, (error, account) =>
            {
              if(error != null)
              {
                Object.keys(members)[x += 1] == undefined ? callback(error) : browseMembersList();
              }

              else
              {
                databaseManager.insertQuery(
                {
                  databaseName: params.database.storage.label,
                  tableName: params.database.storage.tables.rights,
                  args: { account: members[Object.keys(members)[x]].id, service: serviceUuid, upload_files: members[Object.keys(members)[x]].upload == true ? 1 : 0, download_files: members[Object.keys(members)[x]].download == true ? 1 : 0, remove_files: members[Object.keys(members)[x]].remove == true ? 1 : 0, post_comments: members[Object.keys(members)[x]].comment == true ? 1 : 0 }

                }, databaseConnector, (error, result) =>
                {
                  if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

                  Object.keys(members)[x += 1] == undefined ? callback(null) : browseMembersList();
                });
              }
            });
          }

          Object.keys(members).length == 0 ? callback(null) : browseMembersList();
        }
      }
    });
  });
}

/****************************************************************************************************/

module.exports.removeMembersFromAService = (serviceUuid, members, accountID, databaseConnector, params, callback) =>
{
  serviceUuid         == undefined ||
  members             == undefined ||
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    storageAppAdminGet.getAccountAdminRights(accountID, databaseConnector, (error, rights) =>
    {
      if(error != null) callback(error);

      else
      {
        if(rights.add_services_rights == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_MANAGE_USER_RIGHTS });

        else
        {
          var x = 0;

          var browseMembersList = () =>
          {
            accountsGet.getAccountUsingUUID(members[Object.keys(members)[x]], databaseConnector, (error, account) =>
            {
              if(error != null)
              {
                Object.keys(members)[x += 1] == undefined ? callback(error) : browseMembersList();
              }

              else
              {
                databaseManager.deleteQuery(
                {
                  databaseName: params.database.storage.label,
                  tableName: params.database.storage.tables.rights,
                  where: { condition: 'AND', 0: { operator: '=', key: 'account', value: account.id }, 1: { operator: '=', key: 'service', value: serviceUuid } }

                }, databaseConnector, (error, result) =>
                {
                  if(error != null) return callback({ status: 500, code: Constants.SQL_SERVER_ERROR, detail: error });

                  Object.keys(members)[x += 1] == undefined ? callback(null) : browseMembersList();
                });
              }
            });
          }

          Object.keys(members).length == 0 ? callback(null) : browseMembersList();
        }
      }
    });
  });
}

/****************************************************************************************************/

module.exports.addRightOnService = (accountID, serviceUuid, right, databaseConnector, params, callback) =>
{
  if(accountID == undefined || serviceUuid == undefined || right == undefined || databaseConnector == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  var rightToUpdate = null;

  switch(right)
  {
    case 'comment':
      rightToUpdate = 'post_comments';
      break;

    case 'upload':
      rightToUpdate = 'upload_files';
      break;

    case 'download':
      rightToUpdate = 'download_files';
      break;

    case 'remove':
      rightToUpdate = 'remove_files';
      break;

    default:
      return callback({ status: 406, code: constants.RIGHT_DOES_NOT_EXIST, detail: null });
      break;
  }

  var argToUpdate = {};

  argToUpdate[rightToUpdate] = 1;

  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.rights,
    args: argToUpdate,
    where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountID }, 1: { operator: '=', key: 'service', value: serviceUuid } }

  }, databaseConnector, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports.removeRightOnService = (accountID, serviceID, right, databaseConnector, params, callback) =>
{
  if(accountID == undefined || serviceID == undefined || right == undefined || databaseConnector == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  var rightToUpdate = null;

  switch(right)
  {
    case 'comment':
      rightToUpdate = 'post_comments';
      break;

    case 'upload':
      rightToUpdate = 'upload_files';
      break;

    case 'download':
      rightToUpdate = 'download_files';
      break;

    case 'remove':
      rightToUpdate = 'remove_files';
      break;

    default:
      return callback({ status: 406, code: constants.RIGHT_DOES_NOT_EXIST, detail: null });
      break;
  }

  var argToUpdate = {};

  argToUpdate[rightToUpdate] = 0;

  oldDatabaseManager.updateQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.rights,
    'args': argToUpdate,
    'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID }, '1': { 'key': 'service', 'value': serviceID } } } }

  }, databaseConnector, (boolean, errorMessage) =>
  {
    if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

    return callback(null);
  });
}

/****************************************************************************************************/

function createStorageFolder(serviceUUID, databaseConnector, params, callback)
{
  foldersCreate.createFolder(serviceUUID, `${params.storage.root}/${params.storage.services}`, (error) =>
  {
    if(error == null) return callback(null);

    console.log('MUST DELETE SERVICE + EXTENSIONS AUTHORIZED');

    return callback(error);
  });
}

/****************************************************************************************************/

function createLogsFolder(serviceUUID, databaseConnector, params, callback)
{
  foldersCreate.createFolder(serviceUUID, `${params.storage.root}/${params.storage.fileLogs}`, (error) =>
  {
    if(error == null) return callback(null);

    console.log('MUST DELETE SERVICE + EXTENSIONS AUTHORIZED');

    return callback(error);
  });
}

/****************************************************************************************************/

module.exports.removeService = (serviceUUID, accountID, databaseConnection, params, callback) =>
{
    storageAppServicesGet.getServiceUsingUUID(serviceUUID, databaseConnection, (error, service) =>
    {
      if(error != null) return callback(error);

      storageAppAdminGet.getAccountAdminRights(accountID, databaseConnection, (error, rights) =>
      {
        if(error != null) return callback(error);

        if(rights.remove_services == 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_SERVICES, detail: null });

        removeFilesFromService(service, accountID, databaseConnection, params, (error) => {});
        removeFoldersFromService(service, databaseConnection, params, (error) => {});

        databaseManager.deleteQuery(
        {
          databaseName: params.database.storage.label,
          tableName: params.database.storage.tables.extensionsForService,
          where: { operator: '=', key: 'service_uuid', value: serviceUUID }

        }, databaseConnection, (error, result) =>
        {
          if(error) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

          databaseManager.deleteQuery(
          {
            databaseName: params.database.storage.label,
            tableName: params.database.storage.tables.services,
            where: { operator: '=', key: 'uuid', value: serviceUUID }
  
          }, databaseConnection, (error, result) =>
          {
            if(error) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

            fs.rmdir(`${params.storage.root}/${params.storage.services}/${serviceUUID}`, (error) =>
            {
              return callback(null);
            });
          });
        });
      });
    });
}

/****************************************************************************************************/

function removeFilesFromService(service, accountID, databaseConnector, params, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.files,
    args: [ '*' ],
    where: { operator: '=', key: 'service', value: service.id }

  }, databaseConnector, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var x = 0;

    if(result[x] == undefined) return callback(null);

    var filesToRemove = [];

    var browseFilesLoop = () =>
    {
      filesToRemove.push(`${result[x].name}.${result[x].ext}`);

      if(result[x += 1] != undefined) browseFilesLoop();

      else
      {
        storageAppFilesRemove.removeFiles(filesToRemove, service, accountID, databaseConnector, (error) =>
        {
          return callback(error);
        });
      }
    }

    browseFilesLoop();
  });
}

/****************************************************************************************************/

module.exports.updateServiceName = (serviceUuid, newServiceName, databaseConnection, params, callback) =>
{
  if(new RegExp('^[a-zA-Zàéèäëïöüâêîôû][a-zA-Zàéèäëïöüâêîôû0-9]*(( )?[a-zA-Zàéèäëïöüâêîôû0-9]+)*$').test(newServiceName) == false)
  {
    return callback({ status: 406, code: constants.WRONG_SERVICE_LABEL_FORMAT, detail: null });
  }

  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: { 'name': newServiceName },
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports.updateServiceMaxFileSize = (serviceUuid, serviceMaxFileSize, databaseConnection, params, callback) =>
{
  databaseManager.updateQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.services,
    args: { 'file_size_limit': serviceMaxFileSize },
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

function removeFoldersFromService(service, databaseConnection, params, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: params.database.storage.label,
    tableName: params.database.storage.tables.folders,
    where:
    {
      operator: '=',
      key: 'service',
      value: service.id
    }
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

    return callback(null);
  });
}

/****************************************************************************************************/