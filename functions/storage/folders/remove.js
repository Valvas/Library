'use strict'

const constants                   = require(`${__root}/functions/constants`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);
const storageAppAdminGet          = require(`${__root}/functions/storage/admin/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);

/****************************************************************************************************/
/* REMOVE FOLDER */
/****************************************************************************************************/

function removeFolder(folderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: folderUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    removeFolderCheckIfAccountIsAdmin(folderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, (error, removedFolders, removedFiles) =>
    {
      return callback(error, removedFolders, removedFiles);
    });
  });
}

/****************************************************************************************************/

function removeFolderCheckIfAccountIsAdmin(folderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, (error, isAppAdmin) =>
  {
    if(error != null) return callback(error);

    if(isAppAdmin == false) return removeFolderGetAccountRightsOnService(folderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);

    return removeFolderGetChildrenFolders(folderUuid, [], 0, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFolderGetAccountRightsOnService(folderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(accountRightsOnService.isAdmin == false && accountRightsOnService.removeFolders == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_FOLDERS, detail: null });

    return removeFolderGetChildrenFolders(folderUuid, [], 0, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFolderGetChildrenFolders(folderUuid, removedFolders, removedFiles, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'parent_folder', value: folderUuid }, 1: { operator: '=', key: 'is_directory', value: 1 }, 2: { operator: '=', key: 'is_deleted', value: 0 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    var index = 0;

    var browseChildren = () =>
    {
      removeFolderGetChildrenFolders(result[index].uuid, removedFolders, removedFiles, databaseConnection, globalParameters, (error) =>
      {
        if(error != null) return callback(error);

        result[index += 1] == undefined
        ? removeFolderRemoveFilesInCurrentFolder(folderUuid, removedFolders, removedFiles, databaseConnection, globalParameters, callback)
        : browseChildren();
      });
    }

    if(result.length === 0) return removeFolderRemoveFilesInCurrentFolder(folderUuid, removedFolders, removedFiles, databaseConnection, globalParameters, callback);

    browseChildren();
  });
}

/****************************************************************************************************/

function removeFolderRemoveFilesInCurrentFolder(folderUuid, removedFolders, removedFiles, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { is_deleted: 1 },
    where: { condition: 'AND', 0: { operator: '=', key: 'is_deleted', value: 0 }, 1: { operator: '=', key: 'is_directory', value: 0 }, 2: { operator: '=', key: 'parent_folder', value: folderUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return removeFolderRemoveFoldersInCurrentFolder(folderUuid, removedFolders, (removedFiles + result.affectedRows), databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFolderRemoveFoldersInCurrentFolder(folderUuid, removedFolders, removedFiles, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { is_deleted: 1 },
    where: { condition: 'OR', 0: { operator: '=', key: 'uuid', value: folderUuid }, 1: { operator: '=', key: 'parent_folder', value: folderUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    removedFolders.push(folderUuid);

    return callback(null, removedFolders, removedFiles);
  });
}

/****************************************************************************************************/

module.exports =
{
  removeFolder: removeFolder
}
