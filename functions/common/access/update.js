'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.addAccessToAppForAccount = (accountUuid, appName, databaseConnection, globalParameters, callback) =>
{
  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    databaseManager.selectQuery(
    {
      databaseName: globalParameters.database[appName].label,
      tableName: globalParameters.database[appName].tables.accountsList,
      args: [ '*' ],
      where: { operator: '=', key: 'account_uuid', value: accountUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      if(result.length > 0) return callback(null);

      databaseManager.insertQuery(
      {
        databaseName: globalParameters.database[appName].label,
        tableName: globalParameters.database[appName].tables.accountsList,
        args: { account_uuid: accountUuid }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

        return callback(null);
      });
    });
  });
}

/****************************************************************************************************/

module.exports.removeAccessToAppForAccount = (accountUuid, appName, databaseConnection, globalParameters, callback) =>
{
  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    databaseManager.deleteQuery(
    {
      databaseName: globalParameters.database[appName].label,
      tableName: globalParameters.database[appName].tables.accountsList,
      where: { operator: '=', key: 'account_uuid', value: accountUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/