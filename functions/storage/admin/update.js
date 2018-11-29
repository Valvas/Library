'use strict'

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);
const storageAppAdminGet    = require(`${__root}/functions/storage/admin/get`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/
// UPDATE ACCOUNT ADMIN STATUS
/****************************************************************************************************/

function updateAccountAdminStatus(accountUuid, updateToAdmin, databaseConnection, globalParameters, callback)
{
  if(accountUuid == undefined)                return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(updateToAdmin == undefined)              return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'updateToAdmin' });
  if(globalParameters == undefined)           return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  updateAccountAdminStatusCheckIfUpdatedAccountExists(accountUuid, updateToAdmin, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function updateAccountAdminStatusCheckIfUpdatedAccountExists(accountUuid, updateToAdmin, databaseConnection, globalParameters, callback)
{
  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    if( updateToAdmin) return updateAccountAdminStatusCheckIfAccountHasAlreadyAdminRights(accountUuid, databaseConnection, globalParameters, callback);

    return updateAccountAdminStatusRemoveRights(accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateAccountAdminStatusCheckIfAccountHasAlreadyAdminRights(accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.globalAdministration,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }
    
  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length > 0) return callback(null);

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.storage.label,
      tableName: globalParameters.database.storage.tables.globalAdministration,
      args: { account_uuid: accountUuid }
      
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/

function updateAccountAdminStatusRemoveRights(accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: globalParameters.database.storage.label,
    tableName: globalParameters.database.storage.tables.globalAdministration,
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

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