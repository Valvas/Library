'use strict'

const uuid                        = require('uuid');
const constants                   = require(`${__root}/functions/constants`);
const databaseManager             = require(`${__root}/functions/database/MySQLv3`);
const storageAppAdminGet          = require(`${__root}/functions/storage/admin/get`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);
const storageAppServicesRights    = require(`${__root}/functions/storage/services/rights`);

/****************************************************************************************************/
/* ADD COMMENT FILE LOG */
/****************************************************************************************************/

function addCommentFileLog(fileComment, fileUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  if(fileUuid == undefined)           return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileUuid' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(fileComment == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'fileComment' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(new RegExp('^(\\S)+(( )?(\\S)+)*$').test(fileComment) == false) return callback({ status: 406, code: constants.WRONG_COMMENT_FORMAT, detail: null });

  addCommentFileLogCheckIfFileExists(fileComment, fileUuid, accountUuid, databaseConnection, globalParameters, (error, serviceUuid, isAppAdmin, accountRightsOnService) =>
  {
    return callback(error, serviceUuid, isAppAdmin, accountRightsOnService);
  });
}

/****************************************************************************************************/

function addCommentFileLogCheckIfFileExists(fileComment, fileUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppFilesGet.getFileFromDatabaseUsingUuid(fileUuid, databaseConnection, globalParameters, (error, fileExists, fileData) =>
  {
    if(error != null) return callback(error);

    if(fileExists == false) return callback({ status: 404, code: constants.FILE_NOT_FOUND, detail: null });

    return addCommentFileLogCheckIfAccountIsAppAdmin(fileComment, fileUuid, fileData.service_uuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addCommentFileLogCheckIfAccountIsAppAdmin(fileComment, fileUuid, serviceUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, (error, isAppAdmin) =>
  {
    if(error != null) return callback(error);

    if(isAppAdmin) return addCommentFileLogInsertInDatabase(fileComment, fileUuid, accountUuid, serviceUuid, isAppAdmin, null, databaseConnection, globalParameters, callback);

    return addCommentFileLogCheckAccountRightsOnService(fileComment, fileUuid, serviceUuid, accountUuid, isAppAdmin, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addCommentFileLogCheckAccountRightsOnService(fileComment, fileUuid, serviceUuid, accountUuid, isAppAdmin, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(accountRightsOnService.isAdmin == false && accountRightsOnService.postComments == false) return callback({ status: 403, code: constants.UNAUTHORIZED_TO_POST_COMMENTS, detail: null });

    return addCommentFileLogInsertInDatabase(fileComment, fileUuid, accountUuid, serviceUuid, isAppAdmin, accountRightsOnService, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addCommentFileLogInsertInDatabase(fileComment, fileUuid, accountUuid, serviceUuid, isAppAdmin, accountRightsOnService, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { uuid: generatedUuid, element_uuid: fileUuid, type: globalParameters.fileLogs.fileCommented, account_uuid: accountUuid, date: Date.now(), comment: fileComment.replace(/\"/g, '\\"') }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, serviceUuid, isAppAdmin, accountRightsOnService);
  });
}

/****************************************************************************************************/
/* ADD UPLOAD FILE LOG */
/****************************************************************************************************/

function addUploadFileLog(accountUuid, fileUuid, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { uuid: generatedUuid, element_uuid: fileUuid, type: globalParameters.fileLogs.fileUploaded, account_uuid: accountUuid, date: Date.now() }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/
/* ADD REMOVE FILE LOG */
/****************************************************************************************************/

function addRemoveFileLog(accountUuid, fileUuid, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { uuid: generatedUuid, element_uuid: fileUuid, type: globalParameters.fileLogs.fileRemoved, account_uuid: accountUuid, date: Date.now() }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/
/* ADD DOWNLOAD FILE LOG */
/****************************************************************************************************/

function addDownloadFileLog(accountUuid, fileUuid, databaseConnection, globalParameters, callback)
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
/* REMOVE FILE COMMENT LOG */
/****************************************************************************************************/

function removeFileCommentLog(commentUuid, accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: commentUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.COMMENT_NOT_FOUND, detail: null });

    removeFileCommentLogCheckIfAccountIsAppAdmin(result[0], accountUuid, serviceUuid, databaseConnection, globalParameters, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/

function removeFileCommentLogCheckIfAccountIsAppAdmin(commentData, accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, (error, isAppAdmin) =>
  {
    if(error != null) return callback(error);

    if(isAppAdmin) return removeFileCommentLogUpdateLogInDatabase(commentData, databaseConnection, globalParameters, callback);

    return removeFileCommentLogCheckAccountRightsOnService(commentData, accountUuid, serviceUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeFileCommentLogCheckAccountRightsOnService(commentData, accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(accountRightsOnService.isAdmin) return removeFileCommentLogUpdateLogInDatabase(commentData, databaseConnection, globalParameters, callback);

    if(accountRightsOnService.removeAllCommentsOnFile) return removeFileCommentLogUpdateLogInDatabase(commentData, databaseConnection, globalParameters, callback);

    if(accountRightsOnService.removeOwnCommentsOnFile && (commentData.account_uuid === accountUuid)) return removeFileCommentLogUpdateLogInDatabase(commentData, databaseConnection, globalParameters, callback);

    return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_THIS_COMMENT, detail: null });
  });
}

/****************************************************************************************************/

function removeFileCommentLogUpdateLogInDatabase(commentData, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { type: globalParameters.fileLogs.fileCommentRemoved },
    where: { operator: '=', key: 'uuid', value: commentData.uuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/
/* UPDATE FILE COMMENT LOG */
/****************************************************************************************************/

function updateFileCommentLog(newCommentContent, commentUuid, accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  if(new RegExp('^(\\S)+(( )?(\\S)+)*$').test(newCommentContent) == false) return callback({ status: 406, code: constants.WRONG_COMMENT_FORMAT, detail: null });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: commentUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.COMMENT_NOT_FOUND, detail: null });

    updateFileCommentLogCheckIfAccountIsAppAdmin(newCommentContent, result[0], accountUuid, serviceUuid, databaseConnection, globalParameters, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/

function updateFileCommentLogCheckIfAccountIsAppAdmin(newCommentContent, commentData, accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  storageAppAdminGet.checkIfAccountIsAdmin(accountUuid, databaseConnection, globalParameters, (error, isAppAdmin) =>
  {
    if(error != null) return callback(error);

    if(isAppAdmin) return updateFileCommentLogUpdateLogInDatabase(newCommentContent, commentData, databaseConnection, globalParameters, callback);

    return updateFileCommentLogCheckAccountRightsOnService(newCommentContent, commentData, accountUuid, serviceUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateFileCommentLogCheckAccountRightsOnService(newCommentContent, commentData, accountUuid, serviceUuid, databaseConnection, globalParameters, callback)
{
  storageAppServicesRights.getRightsTowardsService(serviceUuid, accountUuid, databaseConnection, globalParameters, (error, accountRightsOnService) =>
  {
    if(error != null) return callback(error);

    if(accountRightsOnService.isAdmin) return updateFileCommentLogUpdateLogInDatabase(newCommentContent, commentData, databaseConnection, globalParameters, callback);

    if(accountRightsOnService.editAllCommentsOnFile) return updateFileCommentLogUpdateLogInDatabase(newCommentContent, commentData, databaseConnection, globalParameters, callback);

    if(accountRightsOnService.editOwnCommentsOnFile && (commentData.account_uuid === accountUuid)) return updateFileCommentLogUpdateLogInDatabase(newCommentContent, commentData, databaseConnection, globalParameters, callback);

    return callback({ status: 403, code: constants.UNAUTHORIZED_TO_UPDATE_THIS_COMMENT, detail: null });
  });
}

/****************************************************************************************************/

function updateFileCommentLogUpdateLogInDatabase(newCommentContent, commentData, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.serviceElementsLogs,
    args: { comment: newCommentContent },
    where: { operator: '=', key: 'uuid', value: commentData.uuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  addUploadFileLog: addUploadFileLog,
  addRemoveFileLog: addRemoveFileLog,
  addCommentFileLog: addCommentFileLog,
  addDownloadFileLog: addDownloadFileLog,
  removeFileCommentLog: removeFileCommentLog,
  updateFileCommentLog: updateFileCommentLog
}

/****************************************************************************************************/