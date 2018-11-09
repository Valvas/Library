'use strict'

const uuid                                = require('uuid');
const constants                           = require(`${__root}/functions/constants`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppAdminGet                  = require(`${__root}/functions/storage/admin/get`);
const commonFilesMove                     = require(`${__root}/functions/common/files/move`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const commonFoldersCreate                 = require(`${__root}/functions/common/folders/create`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
// CHECK PARAMETERS FOR CURRENT FILE BEFORE UPLOAD
/****************************************************************************************************/

module.exports.prepareUpload = (fileName, fileSize, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback) =>
{
  storageAppServicesGet.checkIfServiceExistsFromUuid(serviceUuid, databaseConnection, globalParameters, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    getAccountRightsOnCurrentService(accountUuid, serviceUuid, databaseConnection, globalParameters, (error, rightsLevel, serviceRights) =>
    {
      if(error != null) return callback(error);

      if(serviceRights.uploadFiles > rightsLevel) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_ADD_FILES, detail: null });

      if(fileSize > serviceData.file_size_limit) return callback({ status: 406, code: constants.FILE_SIZE_EXCEED_MAX_ALLOWED, detail: null });

      if(fileName.length > globalParameters.storage.maxFileNameSize) return callback({ status: 406, code: constants.FILE_NAME_EXCEED_SIZE_LIMIT, detail: globalParameters.storage.maxFileNameSize });
    
      storageAppServicesGet.getAuthorizedExtensionsForService(serviceUuid, databaseConnection, globalParameters, (error, authorizedExtensions) =>
      {
        if(error != null) return callback(error);

        var extensionFound = false;

        for(var element in authorizedExtensions)
        {
          if(authorizedExtensions[element] === fileName.split('.')[fileName.split('.').length - 1]) extensionFound = true;
        }

        if(extensionFound == false) return callback({ status: 406, code: constants.UNAUTHORIZED_FILE, detail: null });

        checkIfParentFolderExists(parentFolderUuid, databaseConnection, globalParameters, (error) =>
        {
          if(error != null) return callback(error);

          databaseManager.selectQuery(
          {
            databaseName: globalParameters.database.storage.label,
            tableName: globalParameters.database.storage.tables.serviceElements,
            args: [ '*' ],
            where: { condition: 'AND', 0: { operator: '=', key: 'name', value: fileName }, 1: { operator: '=', key: 'is_directory', value: 0 }, 2: { operator: '=', key: 'is_deleted', value: 0 }, 3: { operator: '=', key: 'parent_folder', value: parentFolderUuid } }

          }, databaseConnection, (error, result) =>
          {
            if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

            if(result.length === 0) return callback(null, false);

            if(serviceRights.removeFiles > rightsLevel) return callback(null, true, false);

            return callback(null, true, true);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/

function checkIfParentFolderExists(parentFolderUuid, databaseConnection, globalParameters, callback)
{
  if(parentFolderUuid == null) return callback(null);

  storageAppFilesGet.checkIfFolderExistsInDatabase(parentFolderUuid, databaseConnection, globalParameters, (error, folderExists, folderData) =>
  {
    if(error != null) return callback(error);

    if(folderExists == false) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    if(folderData.is_deleted) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    return callback(null);
  });
}

/****************************************************************************************************/

function getAccountRightsOnCurrentService(accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, rightsLevel) =>
  {
    if(error != null) return callback(error);

    storageAppAdminGet.getServiceLevelForEachRight(databaseConnection, globalParameters, (error, serviceRights) =>
    {
      if(error != null) return callback(error);

      return callback(null, rightsLevel, serviceRights);
    });
  });
}

/****************************************************************************************************/
// WHEN A FILE IS UPLOADED TO A SERVICE
/****************************************************************************************************/

module.exports.uploadFile = (tmpFilePath, fileName, fileSize, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback) =>
{
  if(fileName == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileName' });
  if(fileSize == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileSize' });
  if(tmpFilePath == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'tmpFilePath' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(accountUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(globalParameters == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(fileName.length > globalParameters.storage.maxFileNameSize) return callback({ status: 406, code: constants.FILE_NAME_EXCEED_SIZE_LIMIT, detail: globalParameters.storage.maxFileNameSize });

  uploadFileCheckIfServiceExists(tmpFilePath, fileName, fileSize, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, (error, fileUuid, serviceRights, accountRightsLevel) =>
  {
    return callback(error, fileUuid, serviceRights, accountRightsLevel);
  });
}

/****************************************************************************************************/

function uploadFileCheckIfServiceExists(tmpFilePath, fileName, fileSize, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesGet.checkIfServiceExistsFromUuid(serviceUuid, databaseConnection, globalParameters, (error, serviceExists, serviceData) =>
  {
    if(error != null) return callback(error);

    if(serviceExists == false) return callback({ status: 404, code: constants.SERVICE_NOT_FOUND, detail: null });

    if(fileSize > serviceData.file_size_limit) return callback({ status: 406, code: constants.FILE_SIZE_EXCEED_MAX_ALLOWED, detail: null });

    commonFoldersCreate.createFolder(serviceData.serviceUuid, `${globalParameters.storage.root}/${globalParameters.storage.services}`, (error) =>
    {
      if(error != null) return callback(error);

      return uploadFileCheckIfExtensionIsAuthorized(tmpFilePath, fileName, serviceData.serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function uploadFileCheckIfExtensionIsAuthorized(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesGet.getAuthorizedExtensionsForService(serviceUuid, databaseConnection, globalParameters, (error, authorizedExtensions) =>
  {
    if(error != null) return callback(error);

    var extensionFound = false;

    for(var element in authorizedExtensions)
    {
      if(authorizedExtensions[element] === fileName.split('.')[fileName.split('.').length - 1]) extensionFound = true;
    }

    if(extensionFound == false) return callback({ status: 406, code: constants.UNAUTHORIZED_FILE, detail: null });

    return uploadFileCheckIfUserHasRightsToUpload(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function uploadFileCheckIfUserHasRightsToUpload(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, rightsLevel) =>
  {
    if(error != null) return callback(error);

    storageAppAdminGet.getServiceLevelForEachRight(databaseConnection, globalParameters, (error, serviceRights) =>
    {
      if(error != null) return callback(error);

      if(serviceRights.uploadFiles > rightsLevel) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_ADD_FILES, detail: null });
    
      return uploadFileCheckIfParentFolderExists(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, rightsLevel, serviceRights, callback);
    });
  });
}

/****************************************************************************************************/

function uploadFileCheckIfParentFolderExists(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, rightsLevel, serviceRights, callback)
{
  if(parentFolderUuid == null) return uploadFileCheckIfFileExists(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, rightsLevel, serviceRights, callback);

  storageAppFilesGet.checkIfFolderExistsInDatabase(parentFolderUuid, databaseConnection, globalParameters, (error, folderExists, folderData) =>
  {
    if(error != null) return callback(error);

    if(folderExists == false) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    if(folderData.is_deleted) return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

    return uploadFileCheckIfFileExists(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, rightsLevel, serviceRights, callback);
  });
}

/****************************************************************************************************/

function uploadFileCheckIfFileExists(tmpFilePath, fileName, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, rightsLevel, serviceRights, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'name', value: fileName }, 1: { operator: '=', key: 'is_directory', value: 0 }, 2: { operator: '=', key: 'is_deleted', value: 0 }, 3: { operator: '=', key: 'parent_folder', value: parentFolderUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length > 0 && serviceRights.removeFiles > rightsLevel) return callback({ status: 406, code: constants.FILE_ALREADY_EXISTS, detail: null });

    if(result.length > 0) return uploadFileUpdateOldFileEntryInDatabase(tmpFilePath, fileName, serviceRights, rightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, result[0].uuid, callback);

    return uploadFileCreateEntryInDatabase(tmpFilePath, fileName, serviceRights, rightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function uploadFileUpdateOldFileEntryInDatabase(tmpFilePath, fileName, serviceRights, accountRightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, oldFileUuid, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { is_deleted: 1 },
    where: { operator: '=', key: 'uuid', value: oldFileUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return uploadFileMoveOldFileToBin(tmpFilePath, fileName, serviceRights, accountRightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, oldFileUuid, callback);
  });
}

/****************************************************************************************************/

function uploadFileMoveOldFileToBin(tmpFilePath, fileName, serviceRights, accountRightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, oldFileUuid, callback)
{
  commonFilesMove.moveFile(`${globalParameters.storage.root}/${globalParameters.storage.services}/${serviceUuid}/${oldFileUuid}`, `${globalParameters.storage.root}/${globalParameters.storage.bin}/${oldFileUuid}`, (error) =>
  {
    if(error != null) return callback(error);

    return uploadFileCreateRemoveLog(tmpFilePath, fileName, serviceRights, accountRightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, oldFileUuid, callback);
  });
}

/****************************************************************************************************/

function uploadFileCreateRemoveLog(tmpFilePath, fileName, serviceRights, accountRightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, oldFileUuid, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { uuid: generatedUuid, element_uuid: oldFileUuid, account_uuid: accountUuid, date: Date.now(), type: globalParameters.fileLogs.remove }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return uploadFileCreateEntryInDatabase(tmpFilePath, fileName, serviceRights, accountRightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function uploadFileCreateEntryInDatabase(tmpFilePath, fileName, serviceRights, accountRightsLevel, serviceUuid, parentFolderUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElements,
    args: { uuid: generatedUuid, name: fileName, parent_folder: parentFolderUuid, service_uuid: serviceUuid, is_directory: 0, is_deleted: 0 }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return uploadFileMoveNewFile(tmpFilePath, generatedUuid, serviceRights, accountRightsLevel, serviceUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function uploadFileMoveNewFile(tmpFilePath, fileUuid, serviceRights, accountRightsLevel, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  commonFilesMove.moveFile(`${globalParameters.storage.root}/${globalParameters.storage.tmp}/${tmpFilePath}`, `${globalParameters.storage.root}/${globalParameters.storage.services}/${serviceUuid}/${fileUuid}`, (error) =>
  {
    if(error != null) return callback(error);

    return uploadFileCreateUploadLog(fileUuid, accountUuid, serviceRights, accountRightsLevel, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function uploadFileCreateUploadLog(fileUuid, accountUuid, serviceRights, accountRightsLevel, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { uuid: generatedUuid, element_uuid: fileUuid, account_uuid: accountUuid, date: Date.now(), type: globalParameters.fileLogs.upload }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, fileUuid, serviceRights, accountRightsLevel);
  });
}

/****************************************************************************************************/