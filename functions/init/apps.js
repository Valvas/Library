'use strict'

const fs                = require('fs');
const uuid              = require('uuid');
const appsToCreate      = require(`${__root}/json/apps`);
const constants         = require(`${__root}/functions/constants`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.createApps = (databaseConnection, globalParameters, callback) =>
{
  var index = 0;

  var browseAppsToCreate = () =>
  {
    createAppsCheckIfAppExists(appsToCreate[index], databaseConnection, globalParameters, (error) =>
    {
      if(error != null) return callback(error);

      if(appsToCreate[index += 1] == undefined) return callback(null);

      browseAppsToCreate();
    });
  }

  if(appsToCreate[index] == undefined) return callback(null);

  browseAppsToCreate();
}

/****************************************************************************************************/

function createAppsCheckIfAppExists(appName, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.apps,
    args: [ 'uuid' ],
    where: { operator: '=', key: 'name', value: appName }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return createAppInsertIntoDatabase(appName, databaseConnection, globalParameters, callback);

    return createAppUpdatePictureInDatabase(appName, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createAppInsertIntoDatabase(appName, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  fs.readFile(`${__root}/public/pictures/apps/${appName}.png`, (error, data) =>
  {
    if(error) return callback({ status: 404, code: constants.APP_PICTURE_NOT_FOUND, detail: error });

    const base64Picture = new Buffer(data).toString('base64');

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.apps,
      args: { uuid: generatedUuid, name: appName, picture: base64Picture }
  
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
  
      return callback(null);
    });
  });
}

/****************************************************************************************************/

function createAppUpdatePictureInDatabase(appName, databaseConnection, globalParameters, callback)
{
  fs.readFile(`${__root}/public/pictures/apps/${appName}.png`, (error, data) =>
  {
    if(error) return callback({ status: 404, code: constants.APP_PICTURE_NOT_FOUND, detail: error });

    const base64Picture = new Buffer(data).toString('base64');

    databaseManager.updateQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.apps,
      args: { picture: base64Picture },
      where: { operator: '=', key: 'name', value: appName }
  
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/