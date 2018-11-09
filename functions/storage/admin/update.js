'use strict'

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);
const storageAppAdminGet    = require(`${__root}/functions/storage/admin/get`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/
// UPDATE ACCOUNT ADMIN STATUS
/****************************************************************************************************/

function updateAccountAdminStatus(updatedAccountUuid, updatedAccountAdminStatus, databaseConnection, globalParameters, callback)
{
  if(globalParameters == undefined)           return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(updatedAccountUuid == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'updatedAccountUuid' });
  if(databaseConnection == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });
  if(updatedAccountAdminStatus == undefined)  return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'updatedAccountAdminStatus' });

  updateAccountAdminStatusCheckIfUpdatedAccountExists(updatedAccountUuid, updatedAccountAdminStatus, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function updateAccountAdminStatusCheckIfUpdatedAccountExists(updatedAccountUuid, updatedAccountAdminStatus, databaseConnection, globalParameters, callback)
{
  commonAccountsGet.checkIfAccountExistsFromUuid(updatedAccountUuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    if(updatedAccountAdminStatus) return updateAccountAdminStatusCheckIfAccountHasAlreadyAdminRights(updatedAccountUuid, updatedAccountAdminStatus, databaseConnection, globalParameters, callback);

    return updateAccountAdminStatusRemoveRights(updatedAccountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateAccountAdminStatusCheckIfAccountHasAlreadyAdminRights(updatedAccountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.globalAdministration,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: updatedAccountUuid }
    
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length > 0) return callback(null);

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.storage.label,
      tableName: globalParameters.database.storage.tables.globalAdministration,
      args: { account_uuid: updatedAccountUuid }
      
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/

function updateAccountAdminStatusRemoveRights(updatedAccountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.globalAdministration,
    where: { operator: '=', key: 'account_uuid', value: updatedAccountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  updateAccountAdminStatus: updateAccountAdminStatus
}

/****************************************************************************************************/