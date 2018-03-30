'use strict'

const fs                                  = require('fs');
const archiver                            = require('archiver');
const params                              = require(`${__root}/json/params`);
const errors                              = require(`${__root}/json/errors`);
const constants                           = require(`${__root}/functions/constants`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppLogsServicesDownloadFile  = require(`${__root}/functions/storage/logs/services/downloadFile`);

/****************************************************************************************************/

module.exports.downloadFiles = (filesToDownload, serviceName, databaseConnector, account, callback) =>
{
  if(filesToDownload == undefined || serviceName == undefined || databaseConnector == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else if(filesToDownload.length == 0) callback({ status: 406, code: constants.NO_FILE_TO_DOWNLOAD });

  else
  {
    storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
    {
      if(error != null) callback(error);

      else
      {
        var x = 0, y = 0;

        var checkFiles = () =>
        {
          storageAppFilesGet.getFileFromDatabase(filesToDownload[x].split('.')[0], filesToDownload[x].split('.')[1], service.id, databaseConnector, (error, file) =>
          {
            if(error != null) callback(error);

            else
            {
              storageAppFilesGet.getFileFromDisk(filesToDownload[x].split('.')[0], filesToDownload[x].split('.')[1], serviceName, databaseConnector, (error, fileStats) =>
              {
                if(error != null) callback(error);

                else
                {
                  storageAppLogsServicesDownloadFile.addDownloadFileLog(params.fileLogs.download, account.id, file.id, filesToDownload[x].split('.')[0], filesToDownload[x].split('.')[1], serviceName, databaseConnector, (error) =>
                  {
                    if(error != null) callback(error);

                    else
                    {
                      if(filesToDownload[x += 1] != undefined) checkFiles();

                      else
                      {
                        if(filesToDownload.length == 1) callback(null, `${params.storage.root}/${params.storage.services}/${serviceName}/${filesToDownload[0]}`);

                        else
                        {
                          createArchiveFromFiles(filesToDownload, serviceName, account, (error, archivePath) =>
                          {
                            error == null ? callback(null, archivePath) : callback(error);
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

        checkFiles();
      }
    });
  }
}

/****************************************************************************************************/

function createArchiveFromFiles(filesToDownload, service, account, callback)
{
  var archiveName = `${account.id}-${Date.now()}.zip`;
  var output = fs.createWriteStream(`${params.storage.root}/${params.storage.tmp}/${archiveName}`);
  var archive = archiver('zip');

  output.on('close', () =>
  {
    callback(null, `${params.storage.root}/${params.storage.tmp}/${archiveName}`);
  });

  archive.on('error', (error) =>
  {
    callback({ status: 500, code: constants.COULD_NOT_CREATE_ARCHIVE, detail: error.message });
  });

  archive.pipe(output);

  var x = 0;

  var addFilesToArchive = () =>
  {
    archive.file(`${params.storage.root}/${params.storage.services}/${service}/${filesToDownload[x]}`, { name: `${filesToDownload[x]}` });

    filesToDownload[x += 1] != undefined ? addFilesToArchive() : archive.finalize();
  }

  addFilesToArchive();
}

/****************************************************************************************************/