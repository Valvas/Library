'use strict'

const fs                                  = require('fs');
const params                              = require(`${__root}/json/params`);
const errors                              = require(`${__root}/json/errors`);
const constants                           = require(`${__root}/functions/constants`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppFilesSet                  = require(`${__root}/functions/storage/files/set`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppLogsServicesDownloadFile  = require(`${__root}/functions/storage/logs/services/downloadFile`);

/****************************************************************************************************/

module.exports.downloadFile = (fileToDownload, serviceName, databaseConnector, account, callback) =>
{
  if(fileToDownload == undefined || serviceName == undefined || databaseConnector == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else if(fileToDownload.length == 0) callback({ status: 406, code: constants.NO_FILE_TO_DOWNLOAD });

  else
  {
    storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
    {
      if(error != null) callback(error);

      else
      {
        storageAppFilesGet.getFileFromDatabase(fileToDownload.split('.')[0], fileToDownload.split('.')[1], service.id, databaseConnector, (error, file) =>
        {
          if(error != null) callback(error);

          else
          {
            storageAppFilesGet.getFileFromDisk(fileToDownload.split('.')[0], fileToDownload.split('.')[1], serviceName, databaseConnector, (error, fileStats) =>
            {
              if(error != null)
              {
                //File has not been found on the disk and must be put in deleted status in the database before sending the previous error
                if(error.status == 404)
                {
                  storageAppFilesSet.setFileDeleted(file.id, databaseConnector, (ignoredError) =>
                  {
                    callback(error);
                  });
                }

                else
                {
                  callback(error);
                }
              }

              else
              {
                storageAppLogsServicesDownloadFile.addDownloadFileLog(params.fileLogs.download, account.id, file.id, fileToDownload.split('.')[0], fileToDownload.split('.')[1], serviceName, databaseConnector, (error) =>
                {
                  if(error != null) callback(error);

                  else
                  {
                    callback(null, `${params.storage.root}/${params.storage.services}/${serviceName}/${fileToDownload}`);
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

/****************************************************************************************************/