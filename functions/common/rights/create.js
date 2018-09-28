'use strict'

const uuidModule            = require('uuid');
const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.createRightsForAccountOnIntranet = (accountUuid, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    commonRightsGet.checkIfRightsExistsForAccount(accountUuid, databaseConnection, params, (error, rightsExist, rightsData) =>
    {
      if(error != null) return callback(error);

      if(rightsExist) return callback(null);

      const uuid = uuidModule.v4();

      databaseManager.insertQuery(
      {
        databaseName: params.database.root.label,
        tableName: params.database.root.tables.rights,
        args: { account: accountUuid, create_articles: 0, update_articles: 0, update_own_articles: 0, remove_articles: 0, remove_own_articles: 0 }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        return callback(null);
      });
    });
  });
}

/****************************************************************************************************/