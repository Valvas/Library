'use strict'

const params                              = require(`${__root}/json/params`);
const constants                           = require(`${__root}/functions/constants`);
const accountsGet                         = require(`${__root}/functions/accounts/get`);
const filesRemove                         = require(`${__root}/functions/files/remove`);
const storageAppFilesGet                  = require(`${__root}/functions/storage/files/get`);
const storageAppFilesSet                  = require(`${__root}/functions/storage/files/set`);
const storageAppServicesGet               = require(`${__root}/functions/storage/services/get`);
const storageAppServicesRights            = require(`${__root}/functions/storage/services/rights`);
const storageAppLogsRemoveFile            = require(`${__root}/functions/storage/logs/services/removeFile`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager             = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.removeFiles = (filesToRemove, service, accountID, databaseConnector, callback) =>
{
  filesToRemove         == undefined ||
  service               == undefined ||
  accountID             == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    storageAppServicesRights.getRightsTowardsService(service.id, accountID, databaseConnector, (error, rights) =>
    {
      if(error != null) callback(error);

      else
      {
        if(rights.remove_files == 0) callback({ status: 403, code: constants.UNAUTHORIZED_TO_DELETE_FILES, detail: null });

        else
        {
          var x = 0;

          var removeFileLoop = () =>
          {
            filesRemove.moveFileToBin(filesToRemove[x].split('.')[0], filesToRemove[x].split('.')[1], `${params.storage.root}/${params.storage.services}/${service.name}/`, (error) =>
            {
              if(error != null) callback(error);

              else
              {
                storageAppFilesGet.getFileFromDatabaseUsingFullName(filesToRemove[x].split('.')[0], filesToRemove[x].split('.')[1], service.id, databaseConnector, (error, file) =>
                {
                  error != null ? callback(error) :

                  storageAppFilesSet.setFileDeleted(file.id, databaseConnector, (error) =>
                  {
                    if(error != null) callback(error);

                    else
                    {
                      storageAppLogsRemoveFile.addRemoveFileLog(params.fileLogs.remove, accountID, file.id, filesToRemove[x].split('.')[0], filesToRemove[x].split('.')[1], service.name, databaseConnector, (error) =>
                      {
                        if(error != null) callback(error);

                        else
                        {
                          filesToRemove[x += 1] != undefined ? removeFileLoop() : callback(null);
                        }
                      });
                    }
                  });
                });
              }
            });
          }

          if(filesToRemove[x] != undefined) removeFileLoop();

          else
          {
            callback({ status: 406, code: constants.NO_FILE_PROVIDED_IN_REQUEST, detail: null });
          }
        }
      }
    });
  });
}

/****************************************************************************************************/