'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

function createUnits(units, databaseConnection, globalParameters, callback)
{
  createUnitsBrowse(units[0], null, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function createUnitsBrowse(currentUnit, parentUnit, databaseConnection, globalParameters, callback)
{
  createUnitAddInDatabase(currentUnit, parentUnit, databaseConnection, globalParameters, (error, newUnitId) =>
  {
    if(error != null) return callback(error);

    if(currentUnit.children == undefined) return callback(null);

    var index = 0;

    var browseCurrentUnitChildren = () =>
    {
      createUnitsBrowse(currentUnit.children[index], newUnitId, databaseConnection, globalParameters, (error) =>
      {
        if(error != null) return callback(error);

        if(currentUnit.children[index += 1] == undefined) return callback(null);

        browseCurrentUnitChildren();
      });
    }

    browseCurrentUnitChildren();
  });
}

/****************************************************************************************************/

function createUnitAddInDatabase(currentUnit, parentUnit, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: { operator: '=', key: 'name', value: currentUnit.name }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length > 0) return callback(null, result[0].id);

    const args = parentUnit == null
    ? { name: currentUnit.name, is_root: currentUnit.root ? 1 : 0 }
    : { name: currentUnit.name, is_root: currentUnit.root ? 1 : 0, parent_unit: parentUnit };

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.units,
      args: args
  
    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
  
      return callback(null, result.insertId);
    });
  });
}

/****************************************************************************************************/

module.exports =
{
  createUnits: createUnits
}

/****************************************************************************************************/