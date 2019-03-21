'use strict'

const constants                   = require(`${__root}/functions/constants`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

function moveElement(elementToMoveUuid, targetFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  if(elementToMoveUuid === targetFolderUuid) return callback({ status: 406, code: constants.MOVE_ELEMENT_FUNCTION_TARGET_SAME_AS_ELEMENT_TO_MOVE, detail: null });

  moveElementCheckIfItExists(elementToMoveUuid, targetFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, (error, elementToMoveData, elementNewPath) =>
  {
    return callback(error, elementToMoveData, elementNewPath);
  });
}

/****************************************************************************************************/

function moveElementCheckIfItExists(elementToMoveUuid, targetFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: elementToMoveUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.MOVE_ELEMENT_FUNCTION_ELEMENT_NOT_FOUND, detail: null });

    if(result[0].is_deleted) return callback({ status: 406, code: constants.MOVE_ELEMENT_FUNCTION_ELEMENT_REMOVED, detail: null });

    const elementToMoveData = { uuid: result[0].uuid, name: result[0].name, serviceUuid: result[0].service_uuid, isDirectory: result[0].is_directory === 1, parentFolder: result[0].parent_folder.length === 0 ? null : result[0].parent_folder };

    return moveElementCheckIfServiceExists(elementToMoveData, targetFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function moveElementCheckIfServiceExists(elementToMoveData, targetFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.services,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: serviceUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    if(result[0].uuid !== serviceUuid) return callback({ status: 406, code: constants.MOVE_ELEMENT_FUNCTION_ELEMENT_NOT_PART_OF_PROVIDED_SERVICE, detail: null });

    return moveElementCheckIfTargetFolderExists(elementToMoveData, targetFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function moveElementCheckIfTargetFolderExists(elementToMoveData, targetFolderUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  if(targetFolderUuid == null) return moveElementCheckRightsOnService(elementToMoveData, null, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: targetFolderUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.MOVE_ELEMENT_FUNCTION_TARGET_FOLDER_NOT_FOUND, detail: null });

    if(result[0].is_deleted) return callback({ status: 406, code: constants.MOVE_ELEMENT_FUNCTION_TARGET_FOLDER_REMOVED, detail: null });

    const targetFolderData = { uuid: result[0].uuid, name: result[0].name, parentFolder: result[0].parent_folder.length === 0 ? null : result[0].parent_folder };

    return moveElementCheckRightsOnService(elementToMoveData, targetFolderData, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function moveElementCheckRightsOnService(elementToMoveData, targetFolderData, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(elementToMoveData.isDirectory)
    {
      if(accountRightsOnService.isAdmin == false && accountRightsOnService.moveFolders == false)
      {
        return callback({ status: 403, code: constants.UNAUTHORIZED_TO_MOVE_FOLDERS, detail: null });
      }

      if(targetFolderData == null)
      {
        return moveElementCheckForDuplicateNameInTargetFolder(elementToMoveData, null, serviceUuid, databaseConnection, globalParameters, callback);
      }

      return moveElementCheckIfTargetFolderIsNotChildOfElementToMove(elementToMoveData, targetFolderData, serviceUuid, databaseConnection, globalParameters, callback);
    }

    else
    {
      if(accountRightsOnService.isAdmin == false && accountRightsOnService.moveFiles == false)
      {
        return callback({ status: 403, code: constants.UNAUTHORIZED_TO_MOVE_FILES, detail: null });
      }

      return moveElementCheckForDuplicateNameInTargetFolder(elementToMoveData, targetFolderData, serviceUuid, databaseConnection, globalParameters, callback);
    }
  });
}

/****************************************************************************************************/

function moveElementCheckIfTargetFolderIsNotChildOfElementToMove(elementToMoveData, targetFolderData, serviceUuid, databaseConnection, globalParameters, callback)
{
  var currentFolder = targetFolderData.uuid;

  const browseParentFolders = () =>
  {
    databaseManager.selectQuery(
    {
      databaseName: globalParameters.database.storage.label,
      tableName: globalParameters.database.storage.tables.serviceElements,
      args: [ '*' ],
      where: { operator: '=', key: 'uuid', value: currentFolder }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      if(result.length === 0) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

      if(result[0].parent_folder.length === 0)
      {
        return moveElementCheckForDuplicateNameInTargetFolder(elementToMoveData, targetFolderData, serviceUuid, databaseConnection, globalParameters, callback);
      }

      if(result[0].parent_folder === elementToMoveData.uuid)
      {
        return callback({ status: 406, code: constants.MOVE_ELEMENT_FUNCTION_TARGET_SAME_AS_ELEMENT_TO_MOVE, detail: null });
      }

      currentFolder = result[0].parent_folder;

      browseParentFolders();
    });
  }

  browseParentFolders();
}

/****************************************************************************************************/

function moveElementCheckForDuplicateNameInTargetFolder(elementToMoveData, targetFolderData, serviceUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'name', value: elementToMoveData.name }, 1: { operator: '=', key: 'service_uuid', value: serviceUuid }, 2: { operator: '=', key: 'parent_folder', value: targetFolderData == null ? '' : targetFolderData.uuid }, 3: { operator: '=', key: 'is_directory', value: elementToMoveData.isDirectory ? 1 : 0 }, 4: { operator: '=', key: 'is_deleted', value: 0 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return moveElementUpdateParentFolderInDatabase(elementToMoveData, targetFolderData, databaseConnection, globalParameters, callback);

    if(result[0].uuid === elementToMoveData.uuid) return callback({ status: 406, code: constants.MOVE_ELEMENT_FUNCTION_CANNOT_MOVE_ELEMENT_TO_THE_SAME_TARGET, detail: null });

    return callback({ status: 406, code: constants.MOVE_ELEMENT_FUNCTION_DUPLICATE_NAME, detail: null });
  });
}

/****************************************************************************************************/

function moveElementUpdateParentFolderInDatabase(elementToMoveData, targetFolderData, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { parent_folder: targetFolderData == null ? '' : targetFolderData.uuid },
    where: { operator: '=', key: 'uuid', value: elementToMoveData.uuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    elementToMoveData.parentFolder = targetFolderData;

    return moveElementGetNewPath(elementToMoveData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function moveElementGetNewPath(elementToMoveData, databaseConnection, globalParameters, callback)
{
  storageAppFilesGet.getFolderPath(elementToMoveData.uuid, [], databaseConnection, globalParameters, (error, newPath) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, elementToMoveData, newPath);
  });
}

/****************************************************************************************************/

module.exports =
{
  moveElement: moveElement
}

/****************************************************************************************************/
