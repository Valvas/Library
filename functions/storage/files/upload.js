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

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.prepareUpload = (fileName, fileExt, serviceName, account, databaseConnector, callback) =>
{
  storageAppServicesGet.getService(serviceName, databaseConnector, (error, service) =>
  {
    if(error != null) callback(error);

    else
    {
      storageAppServicesRights.getRightsTowardsService(service.id, account.id, databaseConnector, (error, rights) =>
      {
        if(error != null) callback(error);

        else
        {
          if(rights.upload_files == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_UPLOAD_FILES });

          else
          {
            storageAppFilesGet.getFileFromDatabase(fileName, fileExt, service.id, databaseConnector, (error, file) =>
            {
              if(error && error.status != 404) callback(error);

              //File does not exist in database or is in status deleted
              else if((error && error.status == 404) || (error == null && file.deleted == 1))
              {
                storageAppFilesGet.getFileFromDisk(fileName, fileExt, serviceName, databaseConnector, (error, file) =>
                {
                  if(error && error.status != 404) callback(error);

                  //File does not exist on the disk
                  else if(error && error.status == 404)
                  {
                    callback(null);
                  }

                  //File exists on the disk
                  else
                  {
                    filesRemove.moveFileToBin(fileName, fileExt, `${params.storage.root}/${params.storage.services}/${service}`, (error) =>
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
                  if(error && error.status != 404) callback(error);

                  //File does not exist on the disk
                  else if(error && error.status == 404)
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
      });
    }
  });
}

/****************************************************************************************************/

module.exports.uploadFile = (originalFileName, currentFileName, serviceName, accountID, databaseConnector ,callback) =>
{
  originalFileName    == undefined ||
  currentFileName     == undefined ||
  serviceName         == undefined ||
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  //Check if account exists
  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    if(error != null) callback(error);

    else
    {
      //Check if service exists
      storageAppServicesGet.getService(serviceName, databaseConnector, (error, service) =>
      {
        if(error != null) callback(error);

        else
        {
          //get account rights towards current service
          storageAppServicesRights.getRightsTowardsService(service.id, account.id, databaseConnector, (error, rights) =>
          {
            if(error != null) callback(error);

            else
            {
              //Account is not authorized to upload files
              if(rights.upload == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_ADD_FILES });

              else
              {
                //Check if file exists in the database
                storageAppFilesGet.getFileFromDatabase(originalFileName.split('.')[0], originalFileName.split('.')[1], service.id, databaseConnector, (error, file) =>
                {
                  //Unscheduled error
                  if(error != null && error.status != 404) callback(error);

                  //File does not exist in the database
                  else if(error != null && error.status == 404)
                  {
                    storageAppFilesCreate.createFileInDatabase(originalFileName.split('.')[0], originalFileName.split('.')[1], account.id, service.id, databaseConnector, (error) =>
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
                              error == null ? callback(null) : callback(error);
                            });
                          }

                          //File exists on the disk and must be moved to the bin
                          else
                          {
                            filesRemove.moveFileToBin(originalFileName.split('.')[0], originalFileName.split('.')[1], `${params.storage.root}/${params.storage.services}/${service.name}`, (error) =>
                            {
                              if(error) callback(error);

                              else
                              {
                                filesMove.moveFile(`${params.storage.root}/${params.storage.tmp}`, currentFileName, `${params.storage.root}/${params.storage.services}/${service.name}`, originalFileName, (error) =>
                                {
                                  error == null ? callback(null) : callback(error);
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }

                  //File exists in the database
                  else
                  {
                    storageAppFilesSet.setFileOwner(account.id, file.id, databaseConnector, (error) =>
                    {
                      if(error != null) callback(error);

                      else
                      {
                        storageAppFilesSet.setFileNotDeleted(account.id, file.id, databaseConnector, (error) =>
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
                                  error == null ? callback(null) : callback(error);
                                });
                              }

                              //File exists on the disk and must be replaced by the new one
                              else
                              {
                                filesRemove.moveFileToBin(originalFileName.split('.')[0], originalFileName.split('.')[1], `${params.storage.root}/${params.storage.services}/${serviceName}`, (error) =>
                                {
                                  if(error) callback(error);

                                  else
                                  {
                                    filesMove.moveFile(`${params.storage.root}/${params.storage.tmp}`, currentFileName, `${params.storage.root}/${params.storage.services}/${serviceName}`, originalFileName, (error) =>
                                    {
                                      error == null ? callback(null) : callback(error);
                                    });
                                  }
                                });
                              }
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
      });
    }
  });
}

/****************************************************************************************************/