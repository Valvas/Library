'use strict'

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);
const storageAppAdminGet    = require(`${__root}/functions/storage/admin/get`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.updateAccountAdminLevel = (updatedAccountUuid, updatedAccountAdminLevel, updatingAccountAdminLevel, databaseConnection, params, callback) =>
{
  if(params == undefined)                     return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(updatedAccountUuid == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'updatedAccountUuid' });
  if(databaseConnection == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });
  if(updatedAccountAdminLevel == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'updatedAccountAdminLevel' });
  if(updatingAccountAdminLevel == undefined)  return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'updatingAccountAdminLevel' });

  commonAccountsGet.checkIfAccountExistsFromUuid(updatedAccountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    storageAppAdminGet.getAdminRightsForProvidedLevel(updatedAccountAdminLevel, databaseConnection, params, (error, adminLevelExists, adminLevelData) =>
    {
      if(error != null) return callback(error);

      if(adminLevelExists == false) return callback({ status: 406, code: constants.ADMIN_LEVEL_DOES_NOT_EXIST, detail: parseInt(updatedAccountAdminLevel) });

      if(parseInt(updatedAccountAdminLevel) > parseInt(updatingAccountAdminLevel)) return callback({ status: 403, code: constants.ADMIN_LEVEL_TOO_LOW_TO_PERFORM_THIS_REQUEST, detail: null });
      
      storageAppAdminGet.getAccountAdminLevel(updatedAccountUuid, databaseConnection, params, (error, accountRights) =>
      {
        if(error != null) return callback(error);

        databaseManager.updateQuery(
        {
          databaseName: params.database.storage.label,
          tableName: params.database.storage.tables.accountAdminLevel,
          args: { level: parseInt(updatedAccountAdminLevel) },
          where: { operator: '=', key: 'account', value: updatedAccountUuid }

        }, databaseConnection, (error, result) =>
        {
          if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

          return callback(null);
        });
      });
    });
  });
}

/****************************************************************************************************/