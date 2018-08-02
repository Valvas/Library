'use strict'

const fs                                  = require('fs');
const constants                           = require(`${__root}/functions/constants`);
const filesMove                           = require(`${__root}/functions/files/move`);
const accountsGet                         = require(`${__root}/functions/accounts/get`);
const filesRemove                         = require(`${__root}/functions/files/remove`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppFilesSet                  = require(`${__root}/functions/storage/files/set`);
const storageAppFilesCreate               = require(`${__root}/functions/storage/files/create`);
const storageAppFilesRemove               = require(`${__root}/functions/storage/files/remove`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);
const storageAppLogsServicesUploadFile    = require(`${__root}/functions/storage/logs/services/addFile`);
const storageAppLogsServicesRemoveFile    = require(`${__root}/functions/storage/logs/services/removeFile`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
// CHECK PARAMETERS FOR CURRENT FILE BEFORE UPLOAD
/****************************************************************************************************/

module.exports.prepareUpload = (fileName, fileExtension, fileSize, serviceUuid, parentFolderUuid, accountId, databaseConnection, params, callback) =>
{
  getAccountData(fileName, fileExtension, fileSize, serviceUuid, parentFolderUuid, accountId, databaseConnection, params, (error, fileAlreadyExists, rightToRemove, existingFileUuid) =>
  {
    if(error != null) return callback(error);

    return callback(null, fileAlreadyExists, rightToRemove);
  });
}

/****************************************************************************************************/

function getAccountData(fileName, fileExtension, fileSize, serviceUuid, parentFolderUuid, accountId, databaseConnection, params, callback)
{
  accountsGet.getAccountUsingID(accountId, databaseConnection, (error, account) =>
  {
    if(error != null) return callback(error);

    getServiceData(fileName, fileExtension, fileSize, serviceUuid, parentFolderUuid, account, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getServiceData(fileName, fileExtension, fileSize, serviceUuid, parentFolderUuid, account, databaseConnection, params, callback)
{
  storageAppServicesGet.getServiceUsingUUID(serviceUuid, databaseConnection, (error, service) =>
  {
    if(error != null) return callback(error);

    getAccountRightsTowardsCurrentService(fileName, fileExtension, fileSize, service, parentFolderUuid, account, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getAccountRightsTowardsCurrentService(fileName, fileExtension, fileSize, service, parentFolderUuid, account, databaseConnection, params, callback)
{
  storageAppServicesRights.getRightsTowardsService(service.uuid, account.id, databaseConnection, params, (error, rights) =>
  {
    if(error != null) return callback(error);

    if(rights.upload_files == 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_ADD_FILES, detail: null });

    if(fileSize > service.file_size_limit) return callback({ status: 406, code: constants.FILE_SIZE_EXCEED_MAX_ALLOWED, detail: null });

    checkIfFileExtensionIsAuthorizedForCurrentService(fileName, fileExtension, fileSize, service, parentFolderUuid, account, rights, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkIfFileExtensionIsAuthorizedForCurrentService(fileName, fileExtension, fileSize, service, parentFolderUuid, account, rights, databaseConnection, params, callback)
{
  storageAppServicesGet.getAuthorizedExtensionsForService(service.uuid, databaseConnection, params, (error, serviceExtensions) =>
  {
    if(error != null) return callback(error);

    if(serviceExtensions.includes(fileExtension) == false) return callback({ status: 406, code: constants.UNAUTHORIZED_FILE, detail: null });

    checkIfFileExistsInDatabase(fileName, fileExtension, fileSize, service, parentFolderUuid, account, rights, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function checkIfFileExistsInDatabase(fileName, fileExtension, fileSize, service, parentFolderUuid, account, rights, databaseConnection, params, callback)
{
  storageAppFilesGet.checkIfFileExistsInDatabase(fileName, fileExtension, service.uuid, parentFolderUuid, databaseConnection, params, (error, fileExistsInDatabase, fileDataFromDatabase) =>
  {
    if(error != null) return callback(error);

    checkIfFileExistsOnStorage(fileName, fileExtension, service, rights, databaseConnection, params, fileExistsInDatabase, fileDataFromDatabase, callback);
  });
}

/****************************************************************************************************/

function checkIfFileExistsOnStorage(fileName, fileExtension, service, rights, databaseConnection, params, fileExistsInDatabase, fileDataFromDatabase, callback)
{
  if(fileExistsInDatabase)
  {
    storageAppFilesGet.checkIfFileExistsOnStorage(fileDataFromDatabase.uuid, fileExtension, service.uuid, params, (error, fileExistsOnStorage, fileDataFromStorage) =>
    {
      if(error != null) return callback(error);

      if(fileExistsOnStorage && fileDataFromDatabase.deleted == 0) return callback(null, true, rights.remove_files == 1, fileDataFromDatabase.uuid);

      if(fileExistsOnStorage && fileDataFromDatabase.deleted == 1)
      {
        filesRemove.moveFileToBin(fileDataFromDatabase.uuid, fileExtension, `${params.storage.root}/${params.storage.services}/${service.uuid}`, (error) =>
        {
          if(error != null) return callback(error);

          return callback(null, false);
        });
      }

      if(fileExistsOnStorage == false && fileDataFromDatabase.deleted == 0)
      {
        storageAppFilesSet.setFileDeletedInDatabase(fileDataFromDatabase.uuid, databaseConnection, params, (error) =>
        {
          if(error != null) return callback(error);

          return callback(null, false);
        });
      }

      else
      {
        return callback(null, false); 
      }
    });
  }

  else
  {
    return callback(null, false);
  }
}

/****************************************************************************************************/
// WHEN A FILE IS UPLOADED TO A SERVICE
/****************************************************************************************************/

module.exports.uploadFile = (fileName, fileExtension, fileSize, filePath, serviceUuid, parentFolderUuid, accountId, databaseConnection, params, callback) =>
{
  fileName              == undefined ||
  fileExtension         == undefined ||
  fileSize              == undefined ||
  filePath              == undefined ||
  serviceUuid           == undefined ||
  parentFolderUuid      == undefined ||
  accountId             == undefined ||
  databaseConnection    == undefined ||
  params                == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  getAccountData(fileName, fileExtension, fileSize, serviceUuid, parentFolderUuid, accountId, databaseConnection, params, (error, fileAlreadyExists, rightToRemove, existingFileUuid) =>
  {
    if(error != null) return callback(error);

    storageAppFilesGet.checkIfFolderExistsInDatabase(parentFolderUuid, databaseConnection, params, (error, folderExists, folderData) =>
    {
      if(error != null) return callback(error);

      if(folderExists == false && parentFolderUuid !== '') return callback({ status: 404, code: constants.FOLDER_NOT_FOUND, detail: null });

      if(fileAlreadyExists && rightToRemove == false) return callback({ status: 406, code: constants.UNAUTHORIZED_TO_DELETE_FILES, detail: null });

      if(fileAlreadyExists && rightToRemove)
      {
        storageAppFilesRemove.removeFiles([ existingFileUuid ], serviceUuid, accountId, databaseConnection, params, (error) =>
        {
          if(error != null) return callback(error);

          moveNewFile(filePath, existingFileUuid, fileExtension, serviceUuid, accountId, databaseConnection, params, callback);
        });
      }

      else
      {
        storageAppFilesGet.checkIfFileExistsInDatabase(fileName, fileExtension, serviceUuid, parentFolderUuid, databaseConnection, params, (error, fileExists, fileData) =>
        {
          if(error != null) return callback(error);

          if(fileExists)
          {
            moveNewFile(filePath, fileData.uuid, fileExtension, serviceUuid, accountId, databaseConnection, params, callback);
          }

          else
          {
            databaseManager.insertQueryWithUUID(
            {
              databaseName: params.database.storage.label,
              tableName: params.database.storage.tables.files,
              args: { name: fileName, ext: fileExtension, parent_folder: parentFolderUuid, account: accountId, service: serviceUuid, deleted: 0 }

            }, databaseConnection, (error, result, insertedRowUuid) =>
            {
              if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

              moveNewFile(filePath, insertedRowUuid, fileExtension, serviceUuid, accountId, databaseConnection, params, callback);
            });
          }
        });
      }
    });
  });
}

/****************************************************************************************************/

function moveNewFile(filePath, fileUuid, fileExtension, serviceUuid, accountId, databaseConnection, params, callback)
{
  filesMove.moveFile(filePath, `${params.storage.root}/${params.storage.services}/${serviceUuid}`, `${fileUuid}.${fileExtension}`, (error) =>
  {
    if(error != null) return callback(error);

    updateFileStatusInDatabase(fileUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function updateFileStatusInDatabase(fileUuid, accountId, databaseConnection, params, callback)
{
  storageAppFilesSet.setFileNotDeletedInDatabase(fileUuid, databaseConnection, params, (error) =>
  {
    if(error != null) return callback(error);

    updateFileOwnerInDatabase(fileUuid, accountId, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function updateFileOwnerInDatabase(fileUuid, accountId, databaseConnection, params, callback)
{
  storageAppFilesSet.setFileOwner(accountId, fileUuid, databaseConnection, params, (error) =>
  {
    if(error != null) return callback(error);

    return callback(null, fileUuid);
  });
}

/****************************************************************************************************/