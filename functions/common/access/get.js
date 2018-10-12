'use strict'

const constants           = require(`${__root}/functions/constants`);
const commonAppsGet       = require(`${__root}/functions/common/apps/get`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.getAppsAccess = (accountUuid, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'params' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.access,
    args: [ '*' ],
    where: { operator: '=', key: 'account', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    var access = [];

    for(var x = 0; x < result.length; x++)
    {
      access.push(result[x].app);
    }

    return callback(null, access);
  });
}

/****************************************************************************************************/

module.exports.getAccountsThatHaveAccessToProvidedApp = (appName, databaseConnection, params, callback) =>
{
  if(params == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'params' });
  if(appName == undefined)            return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'appName' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'databaseConnection' });

  commonAppsGet.checkIfAppExistsFromName(appName, databaseConnection, params, (error, appExists, appData) =>
  {
    if(error != null) return callback(error);

    if(appExists == false) return callback({ status: 404, code: constants.APP_NOT_FOUND, detail: null });

    databaseManager.selectQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.access,
      args: [ '*' ],
      where: { operator: '=', key: 'app', value: appData.uuid }
  
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      if(result.length === 0) return callback(null, []);
  
      var accounts = [], index = 0;

      var browseAccounts = () =>
      {
        commonAccountsGet.checkIfAccountExistsFromUuid(result[index].account, databaseConnection, params, (error, accountExists, accountData) =>
        {
          if(error != null) return callback(error);

          if(accountExists)
          {
            accounts.push({ uuid: accountData.uuid, email: accountData.email, lastname: accountData.lastname, firstname: accountData.firstname });
          }

          if(result[index += 1] == undefined) return callback(null, accounts);

          browseAccounts();
        });
      }

      browseAccounts();
    });
  });
}

/****************************************************************************************************/