'use strict'

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.getAppsAvailableForAccount = (accountUuid, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.applications,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    const apps = result;

    databaseManager.selectQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.access,
      args: [ '*' ],
      where: { operator: '=', key: 'account', value: accountUuid }
  
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      var accountAccess = [];

      for(var x = 0; x < result.length; x++)
      {
        accountAccess.push(result[x].app);
      }

      var valuesToReturn = [];

      for(var x = 0; x < apps.length; x++)
      {
        accountAccess.includes(apps[x].uuid)
        ? valuesToReturn.push({ uuid: apps[x].uuid, name: apps[x].name, hasAccess: true })
        : valuesToReturn.push({ uuid: apps[x].uuid, name: apps[x].name, hasAccess: false });
      }

      return callback(null, valuesToReturn);
    });
  });
}

/****************************************************************************************************/