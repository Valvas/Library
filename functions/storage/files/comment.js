'use strict'

const constants                   = require(`${__root}/functions/constants`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const commonAccountsGet           = require(`${__root}/functions/common/accounts/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);
const storageAppLogsComment       = require(`${__root}/functions/storage/logs/services/commentFile`);

/****************************************************************************************************/
// ADD COMMENT TO A FILE
/****************************************************************************************************/

module.exports.addCommentToFile = (fileComment, fileUuid, serviceUuid, accountId, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(fileUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileUuid' });
  if(accountId == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountId' });
  if(serviceUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'serviceUuid' });
  if(fileComment == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileComment' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(new RegExp('^(\\S)+(( )?(\\S)+)*$').test(fileComment) == false) return callback({ status: 406, code: constants.WRONG_COMMENT_FORMAT, detail: null });

  getAccountData(fileComment, fileUuid, serviceUuid, accountId, databaseConnection, params, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function getAccountData(fileComment, fileUuid, serviceUuid, accountId, databaseConnection, params, callback)
{
  commonAccountsGet.checkIfAccountExistsFromId(accountId, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    getFileData(fileComment, fileUuid, serviceUuid, accountData, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getFileData(fileComment, fileUuid, serviceUuid, accountData, databaseConnection, params, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, params, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: null });

    getAccountRights(fileComment, fileData, serviceUuid, accountData, databaseConnection, params, callback);
  });
}

/****************************************************************************************************/

function getAccountRights(fileComment, fileData, serviceUuid, accountData, databaseConnection, params, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountData.id, databaseConnection, params, (error, rights) =>
  {
    if(error != null) return callback(error);

    if(rights.comment === 0) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_POST_COMMENTS, detail: null });

    storageAppLogsComment.addCommentFileLog(fileComment, params.fileLogs.comment, accountData.id, fileData.uuid, serviceUuid, databaseConnection, params, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/