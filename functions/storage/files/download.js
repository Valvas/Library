'use strict'

const params                  = require(`${__root}/json/params`);
const constants               = require(`${__root}/functions/constants`);
const storageAppFilesGet      = require(`${__root}/functions/storage/files/get`);
const storageAppServicesGet   = require(`${__root}/functions/storage/services/get`);
const databaseManager         = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.downloadFiles = (filesToDownload, service, databaseConnector, callback) =>
{
  if(filesToDownload == undefined || service == undefined || databaseConnector == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else if(filesToDownload.length == 0) callback({ status: 406, code: constants.NO_FILE_TO_DOWNLOAD });

  else
  {
    storageAppServicesGet.getService(service, databaseConnector, (error, serviceData) =>
    {
      if(error != null) callback(error);

      else
      {
        var x = 0;

        var loop = () =>
        {
          storageAppFilesGet.getFileFromDatabase(filesToDownload[x].split('.')[0], filesToDownload[x].split('.')[1], service, databaseConnector, (error, file) =>
          {

          });
        }

        loop();
      }
    });
  }
}

/****************************************************************************************************/