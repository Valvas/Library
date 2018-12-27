'use strict'

const constants           = require(`${__root}/functions/constants`);
const commonUnitsGet      = require(`${__root}/functions/common/units/get`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* ADD MEMBER IN UNIT */
/****************************************************************************************************/

function addMemberInUnit(unitId, accountUuid, databaseConnection, globalParameters, callback)
{
  if(unitId == undefined)             return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'unitId' });
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  commonUnitsGet.checkIfUnitExists(unitId, databaseConnection, globalParameters, (error, unitExists, unitData) =>
  {
    if(error != null) return callback(error);

    if(unitExists == false) return callback({ status: 404, code: constants.UNIT_NOT_FOUND, detail: null });

    addMemberInUnitRemoveOldAccountEntrie(unitId, accountUuid, databaseConnection, globalParameters, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/

function addMemberInUnitRemoveOldAccountEntrie(unitId, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.unitsMembers,
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return addMemberInUnitInsertInDatabase(unitId, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addMemberInUnitInsertInDatabase(unitId, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.unitsMembers,
    args: { account_uuid: accountUuid, unit_id: unitId }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  addMemberInUnit: addMemberInUnit
}

/****************************************************************************************************/