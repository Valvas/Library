'use strict'

const fs                                  = require('fs');
const params                              = require(`${__root}/json/params`);
const constants                           = require(`${__root}/functions/constants`);
const filesMove                           = require(`${__root}/functions/files/move`);
const accountsGet                         = require(`${__root}/functions/accounts/get`);
const filesRemove                         = require(`${__root}/functions/files/remove`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppFilesSet                  = require(`${__root}/functions/storage/files/set`);
const storageAppFilesCreate               = require(`${__root}/functions/storage/files/create`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);
const storageAppLogsServicesUploadFile    = require(`${__root}/functions/storage/logs/services/addFile`);
const storageAppLogsServicesRemoveFile    = require(`${__root}/functions/storage/logs/services/removeFile`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.prepareUpload = (fileName, fileExt, fileSize, serviceName, accountID, authorizedExt, databaseConnector, callback) =>
{
  fileName              == undefined ||
  fileExt               == undefined ||
  fileSize              == undefined ||
  serviceName           == undefined ||
  accountID             == undefined ||
  authorizedExt         == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
    {
      error != null ? callback(error) :

      storageAppServicesRights.getRightsTowardsService(service.id, accountID, databaseConnector, (error, rights) =>
      {
        if(error != null) callback(error);

        else
        {
          if(rights.upload_files == 0)
          {
            callback({ status: 403, code: constants.UNAUTHORIZED_TO_ADD_FILES, detail: null });
          }

          else
          {
            if(fileSize > service.file_limit) callback({ result: false, code: constants.FILE_SIZE_EXCEED_MAX_ALLOWED, detail: null });

            else
            {
              if(authorizedExt.includes(fileExt) == false) callback({ status: 406, code: constants.UNAUTHORIZED_FILE, detail: null });

              else
              {
                storageAppFilesGet.getFileFromDatabase(fileName, fileExt, service.id, databaseConnector, (error, file) =>
                {
                  if(error != null && error.status != 404) callback(error);

                  //File does not exist in database or is in status deleted
                  else if((error != null && error.status == 404) || (error == null && file.deleted == 1))
                  {
                    storageAppFilesGet.getFileFromDisk(fileName, fileExt, serviceName, databaseConnector, (error, file) =>
                    {
                      if(error != null && error.status != 404) callback(error);

                      //File does not exist on the disk
                      else if(error != null && error.status == 404)
                      {
                        callback(null);
                      }

                      //File exists on the disk
                      else
                      {
                        filesRemove.moveFileToBin(fileName, fileExt, `${params.storage.root}/${params.storage.services}/${serviceName}`, (error) =>
                        {
                          error == null ? callback(null) : callback(error);
                        });
                      }
                    });
                  }

                  //File already exists in database
                  else
                  {
                    storageAppFilesGet.getFileFromDisk(fileName, fileExt, serviceName, databaseConnector, (error, file) =>
                    {
                      if(error != null && error.status != 404) callback(error);

                      //File does not exist on the disk
                      else if(error != null && error.status == 404)
                      {
                        callback(null);
                      }

                      //File exists on the disk
                      else
                      {
                        rights.remove_files == 0 ? callback(null, false) : callback(null, true);
                      }
                    });
                  }
                });
              }
            }
          }
        }
      });
    });
  });
}

/****************************************************************************************************/

module.exports.uploadFile = (originalFileName, currentFileName, serviceName, accountID, databaseConnector , callback) =>
{
  originalFileName    == undefined ||
  currentFileName     == undefined ||
  serviceName         == undefined ||
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  //Check if account exists
  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {console.log(1);
    if(error != null) callback(error);

    else
    {
      //Check if service exists
      storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
      {console.log(2);
        if(error != null) callback(error);

        else
        {
          //get account rights towards current service
          storageAppServicesRights.getRightsTowardsService(service.id, account.id, databaseConnector, (error, rights) =>
          {console.log(3);
            if(error != null) callback(error);

            else
            {
              //Account is not authorized to upload files
              if(rights.upload == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_ADD_FILES });

              else
              {
                //Check if file has an extension, otherwise it must be rejected
                if(originalFileName.split('.').length != 2) callback({ status: 406, code: constants.UNAUTHORIZED_FILE, detail: null });

                else
                {
                  //Check if file exists in the database
                  storageAppFilesGet.getFileFromDatabase(originalFileName.split('.')[0], originalFileName.split('.')[1], service.id, databaseConnector, (error, file) =>
                  {console.log(4);
                    //Unscheduled error
                    if(error != null && error.status != 404) callback(error);

                    //File does not exist in the database
                    else if(error != null && error.status == 404)
                    {
                      storageAppFilesCreate.createFileInDatabase(originalFileName.split('.')[0], originalFileName.split('.')[1], account.id, service.id, databaseConnector, (error, fileID) =>
                      {console.log(5);
                        if(error != null) callback(error);

                        else
                        {
                          //Check if file exists on the disk
                          storageAppFilesGet.getFileFromDisk(originalFileName.split('.')[0], originalFileName.split('.')[1], serviceName, databaseConnector, (error, file) =>
                          {console.log(6);
                            //Unscheduled error
                            if(error != null && error.status != 404) callback(error);

                            //File does not exist on the disk
                            else if(error != null && error.status == 404)
                            {
                              filesMove.moveFile(`${params.storage.root}/${params.storage.tmp}`, currentFileName, `${params.storage.root}/${params.storage.services}/${service.name}`, originalFileName, (error) =>
                              {console.log(7);
                                error != null ? callback(error) :

                                storageAppLogsServicesUploadFile.addUploadFileLog(params.fileLogs.upload, accountID, fileID, originalFileName.split('.')[0], originalFileName.split('.')[1], service.name, databaseConnector, (error) =>
                                {console.log(8);
                                  if(error != null) callback(error);

                                  else
                                  {
                                    callback(null, fileID);
                                  }
                                });
                              });
                            }

                            //File exists on the disk and must be moved to the bin
                            else
                            {
                              filesRemove.moveFileToBin(originalFileName.split('.')[0], originalFileName.split('.')[1], `${params.storage.root}/${params.storage.services}/${service.name}`, (error) =>
                              {console.log(9);
                                error != null ? callback(error) :

                                storageAppLogsServicesRemoveFile.addRemoveFileLog(params.fileLogs.remove, accountID, fileID, originalFileName.split('.')[0], originalFileName.split('.')[1], service.name, databaseConnector, (error) =>
                                {console.log(10);
                                  error != null ? callback(error) :

                                  filesMove.moveFile(`${params.storage.root}/${params.storage.tmp}`, currentFileName, `${params.storage.root}/${params.storage.services}/${service.name}`, originalFileName, (error) =>
                                  {console.log(11);
                                    error != null ? callback(error) :

                                    storageAppLogsServicesUploadFile.addUploadFileLog(params.fileLogs.upload, accountID, fileID, originalFileName.split('.')[0], originalFileName.split('.')[1], service.name, databaseConnector, (error) =>
                                    {console.log(12);
                                      if(error != null) callback(error);

                                      else
                                      {
                                        callback(null, fileID);
                                      }
                                    });
                                  });
                                });
                              });
                            }
                          });
                        }
                      });
                    }

                    //File exists in the database
                    else
                    {
                      var fileID = file.id;

                      if(rights.remove == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_DELETE_FILES });

                      else
                      {
                        storageAppFilesSet.setFileOwner(accountID, fileID, databaseConnector, (error) =>
                        {
                          if(error != null) callback(error);

                          else
                          {
                            storageAppFilesSet.setFileNotDeleted(accountID, fileID, databaseConnector, (error) =>
                            {
                              if(error != null) callback(error);

                              else
                              {
                                //Check if file exists on the disk
                                storageAppFilesGet.getFileFromDisk(originalFileName.split('.')[0], originalFileName.split('.')[1], serviceName, databaseConnector, (error, file) =>
                                {
                                  //Unscheduled error
                                  if(error != null && error.status != 404) callback(error);

                                  //File does not exist on the disk
                                  else if(error != null && error.status == 404)
                                  {
                                    filesMove.moveFile(`${params.storage.root}/${params.storage.tmp}`, currentFileName, `${params.storage.root}/${params.storage.services}/${service.name}`, originalFileName, (error) =>
                                    {
                                      error != null ? callback(error) :

                                      storageAppLogsServicesUploadFile.addUploadFileLog(params.fileLogs.upload, accountID, fileID, originalFileName.split('.')[0], originalFileName.split('.')[1], service.name, databaseConnector, (error) =>
                                      {
                                        if(error != null) callback(error);

                                        else
                                        {
                                          callback(null, fileID);
                                        }
                                      });
                                    });
                                  }

                                  //File exists on the disk and must be replaced by the new one
                                  else
                                  {
                                    filesRemove.moveFileToBin(originalFileName.split('.')[0], originalFileName.split('.')[1], `${params.storage.root}/${params.storage.services}/${serviceName}`, (error) =>
                                    {
                                      error != null ? callback(error) :

                                      storageAppLogsServicesRemoveFile.addRemoveFileLog(params.fileLogs.remove, accountID, fileID, originalFileName.split('.')[0], originalFileName.split('.')[1], service.name, databaseConnector, (error) =>
                                      {
                                        error != null ? callback(error) :

                                        filesMove.moveFile(`${params.storage.root}/${params.storage.tmp}`, currentFileName, `${params.storage.root}/${params.storage.services}/${serviceName}`, originalFileName, (error) =>
                                        {
                                          error != null ? callback(error) :

                                          storageAppLogsServicesUploadFile.addUploadFileLog(params.fileLogs.upload, accountID, fileID, originalFileName.split('.')[0], originalFileName.split('.')[1], service.name, databaseConnector, (error) =>
                                          {
                                            if(error != null) callback(error);

                                            else
                                            {
                                              callback(null, fileID);
                                            }
                                          });
                                        });
                                      });
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    }
                  });
                }
              }
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/