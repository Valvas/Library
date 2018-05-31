'use strict'

const fs                    = require('fs');
const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const foldersCreate         = require(`${__root}/functions/folders/create`);
const storageAppAdminGet    = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesGet = require(`${__root}/functions/storage/services/get`);
const storageAppFilesRemove = require(`${__root}/functions/storage/files/remove`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.createService = (serviceName, serviceLabel, maxFileSize, extensions, accountID, servicesExtensionsAuthorized, databaseConnector, callback) =>
{
  serviceName                   == undefined ||
  serviceLabel                  == undefined ||
  maxFileSize                   == undefined ||
  extensions                    == undefined ||
  servicesExtensionsAuthorized  == undefined ||
  accountID                     == undefined ||
  databaseConnector             == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    storageAppAdminGet.getAccountAdminRights(accountID, databaseConnector, (error, rights) =>
    {
      if(error != null) callback(error);

      else
      {
        if(rights.create_services == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_CREATE_SERVICES });

        else
        {
          serviceName = serviceName.toLowerCase();

          storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
          {
            if(error != null && error.status != 404) callback(error);

            else if(error == null) callback({ status: 406, code: constants.SERVICE_IDENTIFIER_ALREADY_IN_USE });

            else
            {
              storageAppServicesGet.getServiceUsingLabel(serviceLabel, databaseConnector, (error, service) =>
              {
                if(error != null && error.status != 404) callback(error);

                else if(error == null) callback({ status: 406, code: constants.SERVICE_NAME_ALREADY_IN_USE });

                else
                {
                  if(maxFileSize < params.init.minFileSize) callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_LOW });

                  else if(maxFileSize > params.init.maxFileSize) callback({ status: 406, code: constants.SERVICE_FILE_MIN_SIZE_TOO_HIGH });

                  else
                  {
                    databaseManager.insertQuery(
                    {
                      'databaseName': params.database.storage.label,
                      'tableName': params.database.storage.tables.services,
                      'uuid': false,
                      'args': { 'name': serviceName, 'label': serviceLabel, 'file_limit': maxFileSize }
                      
                    }, databaseConnector, (boolean, insertedIDOrErrorMessage) =>
                    {
                      if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: insertedIDOrErrorMessage });

                      else
                      {
                        createStorageFolder(serviceName, insertedIDOrErrorMessage, databaseConnector, (error) =>
                        {
                          error != null ? callback(error) :

                          createLogsFolder(serviceName, insertedIDOrErrorMessage, databaseConnector, (error) =>
                          {
                            error != null ? callback(error) :

                            writeExtensionsInFileAndInAppVar(extensions, serviceName, insertedIDOrErrorMessage, servicesExtensionsAuthorized, (error) =>
                            {
                              error != null ? callback(error) : callback(null, insertedIDOrErrorMessage);
                            });
                          });
                        });
                      }
                    });
                  }
                }
              });
            }
          });
        }
      }
    });
  });
}

/****************************************************************************************************/

module.exports.addMembersToService = (serviceID, members, accountID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
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
                  'databaseName': params.database.storage.label,
                  'tableName': params.database.storage.tables.rights,
                  'uuid': false,
                  'args': { 'account': members[Object.keys(members)[x]].id, 'service': serviceID, 'upload_files': members[Object.keys(members)[x]].upload == true ? 1 : 0, 'download_files': members[Object.keys(members)[x]].download == true ? 1 : 0, 'remove_files': members[Object.keys(members)[x]].remove == true ? 1 : 0, 'post_comments': members[Object.keys(members)[x]].comment == true ? 1 : 0 }

                }, databaseConnector, (boolean, insertedIDOrErrorMessage) =>
                {
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

module.exports.removeMembersFromAService = (serviceID, members, accountID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
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
                  'databaseName': params.database.storage.label,
                  'tableName': params.database.storage.tables.rights,
                  'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'account', 'value': account.id }, '1': { 'key': 'service', 'value': serviceID } } } }

                }, databaseConnector, (boolean, insertedIDOrErrorMessage) =>
                {
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

module.exports.addRightOnService = (accountID, serviceID, right, databaseConnector, callback) =>
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

  argToUpdate[rightToUpdate] = 1;

  databaseManager.updateQuery(
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

module.exports.removeRightOnService = (accountID, serviceID, right, databaseConnector, callback) =>
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

  databaseManager.updateQuery(
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

function createStorageFolder(serviceName, serviceID, databaseConnector, callback)
{
  foldersCreate.createFolder(serviceName, `${params.storage.root}/${params.storage.services}`, (error) =>
  {
    if(error != null)
    {
      databaseManager.deleteQuery(
      {
        'databaseName': params.database.storage.label,
        'tableName': params.database.storage.tables.services,
        'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': serviceID } } }

      }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
      {
        callback(error);
      });
    }

    else
    {
      callback(null);
    }
  });
}

/****************************************************************************************************/

function createLogsFolder(serviceName, serviceID, databaseConnector, callback)
{
  foldersCreate.createFolder(serviceName, `${params.storage.root}/${params.storage.fileLogs}`, (error) =>
  {
    if(error != null)
    {
      databaseManager.deleteQuery(
      {
        'databaseName': params.database.storage.label,
        'tableName': params.database.storage.tables.services,
        'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': serviceID } } }

      }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
      {
        callback(error);
      });
    }

    else
    {
      callback(null);
    }
  });
}

/****************************************************************************************************/

function writeExtensionsInFileAndInAppVar(extensions, serviceName, serviceID, servicesExtensionsAuthorized, callback)
{
  fs.readFile(`${__root}/json/services.json`, (error, data) =>
  {
    if(error)
    {
      databaseManager.deleteQuery(
      {
        'databaseName': params.database.storage.label,
        'tableName': params.database.storage.tables.services,
        'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': insertedIDOrErrorMessage } } }

      }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
      {
        callback(error);
      });
    }

    else
    {
      var json = JSON.parse(data), x = 0;

      delete json[serviceName];
      delete servicesExtensionsAuthorized[serviceName];

      json[serviceName] = {};
      json[serviceName].ext_accepted = {};

      var addExtensionToService = () =>
      {
        json[serviceName].ext_accepted[x] = extensions[Object.keys(extensions)[x]];

        Object.keys(extensions)[x += 1] != undefined ? addExtensionToService() :

        fs.writeFile(`${__root}/json/services.json`, JSON.stringify(json), (error) =>
        {
          servicesExtensionsAuthorized[serviceName] = {};
          servicesExtensionsAuthorized[serviceName].ext_accepted = {};
          servicesExtensionsAuthorized[serviceName].ext_accepted = json[serviceName].ext_accepted;

          callback(null);
        });
      }

      Object.keys(extensions)[x] != undefined ? addExtensionToService() :

      fs.writeFile(`${__root}/json/services.json`, JSON.stringify(json), (error) =>
      {
        servicesExtensionsAuthorized[serviceName] = {};
        servicesExtensionsAuthorized[serviceName].ext_accepted = {};
        servicesExtensionsAuthorized[serviceName].ext_accepted = json[serviceName].ext_accepted;

        callback(null);
      });
    }
  });
}

/****************************************************************************************************/

module.exports.removeService = (serviceName, accountID, databaseConnector, callback) =>
{
  if(serviceName == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'service name is missing' });
  if(accountID == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'account ID is missing' });
  if(databaseConnector == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'database connector is missing' });

  storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
  {
    if(error != null) return callback(error);

    storageAppAdminGet.getAccountAdminRights(accountID, databaseConnector, (error, rights) =>
    {
      if(error != null) return callback(error);

      if(rights.remove_services == 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_SERVICES, detail: null });

      removeFilesFromService(service, accountID, databaseConnector, (error) =>
      {
        if(error != null) return callback(error);

        fs.rmdir(`${params.storage.root}/${params.storage.services}/${serviceName}`, (error) =>
        {
          databaseManager.deleteQuery(
          {
            'databaseName': params.database.storage.label,
            'tableName': params.database.storage.tables.services,
            'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': service.id } } }

          }, databaseConnector, (boolean, errorMessage) =>
          {
            if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

            return callback(null);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/

function removeFilesFromService(service, accountID, databaseConnector, callback)
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'service', 'value': service.id } } }

  }, databaseConnector, (boolean, filesOrErrorMessage) =>
  {
    if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: filesOrErrorMessage });

    var x = 0;

    if(filesOrErrorMessage[x] == undefined) return callback(null);

    var filesToRemove = [];

    var browseFilesLoop = () =>
    {
      filesToRemove.push(`${filesOrErrorMessage[x].name}.${filesOrErrorMessage[x].ext}`);

      if(filesOrErrorMessage[x += 1] != undefined) browseFilesLoop();

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

module.exports.updateServiceLabel = (serviceID, serviceLabel, databaseConnector, callback) =>
{
  if(new RegExp('^[a-zA-Zàéèäëïöüâêîôû][a-zA-Zàéèäëïöüâêîôû0-9]*(( )?[a-zA-Zàéèäëïöüâêîôû0-9]+)*$').test(serviceLabel) == false)
  {
    return callback({ status: 406, code: constants.WRONG_SERVICE_LABEL_FORMAT, detail: null });
  }

  databaseManager.updateQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { 'label': serviceLabel },
    'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': serviceID } } }

  }, databaseConnector, (boolean, errorMessage) =>
  {
    if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports.updateServiceMaxFileSize = (serviceID, serviceMaxFileSize, databaseConnector, callback) =>
{
  databaseManager.updateQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { 'file_limit': serviceMaxFileSize },
    'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': serviceID } } }

  }, databaseConnector, (boolean, errorMessage) =>
  {
    if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

    return callback(null);
  });
}

/****************************************************************************************************/