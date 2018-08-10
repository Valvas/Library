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
    tableName: params.database.root.tables.access,
    args: [ '*' ],
    where: { operator: '=', key: 'account', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, []);

    const currentAccess = result;
    var accessArray = [], index = 0;

    var browseAccess = () =>
    {
      databaseManager.selectQuery(
      {
        databaseName: params.database.root.label,
        tableName: params.database.root.tables.applications,
        args: [ '*' ],
        where: { operator: '=', key: 'uuid', value: currentAccess[index].app }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

        if(result.length == 0) return callback({ status: 404, code: constants.APP_NOT_FOUND, detail: null });

        accessArray.push(result[0].name);

        if(currentAccess[index += 1] == undefined) return callback(null, accessArray);

        browseAccess();
      });
    }
      
    browseAccess();
  });
}

/****************************************************************************************************/