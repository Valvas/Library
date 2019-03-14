'use strict'

const constants                   = require(`${__root}/functions/constants`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const storageAppAdminGet          = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesGet       = require(`${__root}/functions/storage/services/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);

/****************************************************************************************************/
/* RENAME FOLDER */
/****************************************************************************************************/

function updateFolderName(folderName, folderUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  if(folderName == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'folderName' });
  if(folderUuid == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'folderUuid' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(new RegExp('^[A-Za-z0-9]+(( )?[a-zA-Z0-9]+)*$').test(folderName) == false) return callback({ status: 406, code: constants.NEW_FOLDER_NAME_BAD_FORMAT, detail: null });

  updateFolderNameCheckIfItExists(folderName, folderUuid, accountUuid, databaseConnection, globalParameters, (error, serviceUuid) =>
  {
    return callback(error, serviceUuid);
  });
}

/****************************************************************************************************/

function updateFolderNameCheckIfItExists(folderName, folderUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppFilesGet.checkIfFolderExistsInDatabase(folderUuid, databaseConnection, globalParameters, (error, folderExists, folderData) =>
  {
    if(error != null) return callback(error);

    if(folderExists == false) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    return updateFolderNameCheckIfServiceExists(folderName, folderData, folderData.service_uuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateFolderNameCheckIfServiceExists(folderName, folderData, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesGet.checkIfServiceExistsFromUuid(serviceUuid, databaseConnection, globalParameters, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    return updateFolderNameCheckIfAccountIsAppAdmin(folderName, folderData, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateFolderNameCheckIfAccountIsAppAdmin(folderName, folderData, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, (error, accountIsAdmin) =>
  {
    if(error != null) return callback(error);

    if(accountIsAdmin) return updateFolderNameCheckIfNameIsAvailable(folderName, folderData, serviceUuid, databaseConnection, globalParameters, callback);

    return updateFolderNameCheckAccountRightsOnService(folderName, folderData, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateFolderNameCheckAccountRightsOnService(folderName, folderData, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(accountRightsOnService.isAdmin == false && accountRightsOnService.renameFolders == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_RENAME_FOLDERS_FOR_THIS_SERVICE, detail: null });

    return updateFolderNameCheckIfNameIsAvailable(folderName, folderData, serviceUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateFolderNameCheckIfNameIsAvailable(folderName, folderData, serviceUuid, databaseConnection, globalParameters, callback)
{console.log(folderData);
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'is_directory', value: 1 }, 1: { operator: '=', key: 'is_deleted', value: 0 }, 2: { operator: '=', key: 'service_uuid', value: serviceUuid }, 3: { operator: '=', key: 'name', value: folderName }, 4: { operator: '=', key: 'parent_folder', value: folderData.parent_folder } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length > 0) return callback({ status: 406, code: constants.FOLDER_NAME_NOT_AVAILABLE, detail: null });

    return updateFolderNameInDatabase(folderName, folderData, serviceUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateFolderNameInDatabase(folderName, folderData, serviceUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { name: folderName },
    where: { operator: '=', key: 'uuid', value: folderData.uuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, serviceUuid);
  });
}

/****************************************************************************************************/

module.exports =
{
  updateFolderName: updateFolderName
}

/****************************************************************************************************/
