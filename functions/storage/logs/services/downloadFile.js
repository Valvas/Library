'use strict'

const uuid                        = require('uuid');
const constants                   = require(`${__root}/functions/constants`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.addDownloadFileLog = (accountUuid, fileUuid, databaseConnection, globalParameters, callback) =>
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { uuid: generatedUuid, element_uuid: fileUuid, type: globalParameters.fileLogs.fileDownloaded, account_uuid: accountUuid, date: Date.now() }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/