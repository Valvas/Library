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
    if(error != null) return callback(error);

    var x = 0;

    if(filesToRemove[x] == undefined) return callback({ status: 406, code: constants.NO_FILE_PROVIDED_IN_REQUEST, detail: null });

    var removeFileLoop = () =>
    {
      filesRemove.moveFileToBin(filesToRemove[x].split('.')[0], filesToRemove[x].split('.')[1], `${params.storage.root}/${params.storage.services}/${service.name}/`, (error) =>
      {
        if(error != null) return callback(error);

        storageAppFilesGet.getFileFromDatabaseUsingFullName(filesToRemove[x].split('.')[0], filesToRemove[x].split('.')[1], service.id, databaseConnector, (error, file) =>
        {
          if(error != null) return callback(error);

          if(file.deleted == 1)
          {
            filesToRemove[x += 1] != undefined ? removeFileLoop() : callback(null);
          }

          else
          {
            storageAppFilesSet.setFileDeleted(file.id, databaseConnector, (error) =>
            {
              if(error != null) return callback(error);

              storageAppLogsRemoveFile.addRemoveFileLog(params.fileLogs.remove, accountID, file.id, filesToRemove[x].split('.')[0], filesToRemove[x].split('.')[1], service.name, databaseConnector, (error) =>
              {
                if(error != null) return callback(error);

                filesToRemove[x += 1] != undefined ? removeFileLoop() : callback(null);
              });
            });
          }
        });
      });
    }

    removeFileLoop();
  });
}

/****************************************************************************************************/