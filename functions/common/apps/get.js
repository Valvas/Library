'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.getAppsData = (databaseConnection, globalParameters, callback) =>
{
  if(globalParameters === undefined)
  {
    return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'globalParameters' });
  }

  if(databaseConnection === undefined)
  {
    return callback({ status: 406, code: constants.MISSING_DATA_FROM_REQUEST, detail: 'databaseConnection' });
  }

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.apps,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    let appsData = [];

    for(let x = 0; x < result.length; x++)
    {
      appsData.push({ uuid: result[x].uuid, name: result[x].name });
    }

    return callback(null, appsData);
  });
}

/****************************************************************************************************/

module.exports.checkIfAppExistsFromName = (appName, databaseConnection, globalParameters, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.apps,
    args: [ '*' ],
    where: { operator: '=', key: 'name', value: appName }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return callback(null, false);
    }

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

module.exports.checkIfAccountHasAccessToApp = (appName, accountUuid, databaseConnection, globalParameters, callback) =>
{
  if(globalParameters.database[appName] === undefined)
  {
    return callback({ status: 404, code: constants.APP_NOT_FOUND, detail: null });
  }

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database[appName].label,
    tableName: globalParameters.database[appName].tables.accountsList,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    return callback(null, result.length > 0);
  });
}

/****************************************************************************************************/
/* Get Apps Data And Account Access Status To Them */
/****************************************************************************************************/

module.exports.getAccountApps = (accountUuid, databaseConnection, globalParameters, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.apps,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return callback(null, []);
    }

    let appsData = [], index = 0;

    const browseApps = () =>
    {
      databaseManager.selectQuery(
      {
        databaseName: globalParameters.database[result[index].name].label,
        tableName: globalParameters.database[result[index].name].tables.accountsList,
        args: [ '*' ],
        where: { operator: '=', key: 'account_uuid', value: accountUuid }

      }, databaseConnection, (error, access) =>
      {
        if(error !== null)
        {
          return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
        }

        appsData.push({ uuid: result[index].uuid, name: result[index].name, picture: result[index].picture, hasAccess: access.length > 0 });

        if(result[index += 1] === undefined)
        {
          return callback(null, appsData);
        }

        browseApps();
      });
    }

    browseApps();
  });
}

/****************************************************************************************************/
