'use strict'

const constants           = require(`${__root}/functions/constants`);
const commonUnitsGet      = require(`${__root}/functions/common/units/get`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* CREATE UNIT */
/****************************************************************************************************/

function createUnit(unitName, unitParent, databaseConnection, globalParameters, callback)
{
  if(new RegExp('^[a-zéàèâêîôûäëïöüñ]+(( )?[a-zéàèâêîôûäëïöüñ]+)*$').test(unitName.toLowerCase()) == false)
  {
    return callback({ status: 406, code: constants.INCORRECT_UNIT_NAME_FORMAT, detail: null });
  }

  createUnitCheckIfParentExists(unitName, unitParent, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function createUnitCheckIfParentExists(unitName, unitParent, databaseConnection, globalParameters, callback)
{
  commonUnitsGet.checkIfUnitExists(unitParent, databaseConnection, globalParameters, (error, unitExists) =>
  {
    if(error != null) return callback(error);

    if(unitExists == false) return callback({ status: 404, code: constants.UNIT_NOT_FOUND, detail: null });

    return createUnitInsertInDatabase(unitName, unitParent, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createUnitInsertInDatabase(unitName, unitParent, databaseConnection, globalParameters, callback)
{
  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: { name: unitName, is_root: 0, parent_unit: unitParent }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  createUnit: createUnit
}

/****************************************************************************************************/