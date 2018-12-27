'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonUnitsGet      = require(`${__root}/functions/common/units/get`);

/****************************************************************************************************/
/* UPDATE UNIT PARENT */
/****************************************************************************************************/

function updateUnitParent(unitId, newParentId, databaseConnection, globalParameters, callback)
{
  commonUnitsGet.getUnitDetail(unitId, databaseConnection, globalParameters, (error, unitDetail) =>
  {
    if(error != null) return callback(error);

    if(unitDetail.unitChildren.includes(newParentId)) return callback({ status: 406, code: constants.UNIT_CANNOT_BE_CHILD_OF_ITS_OWN_CHILDREN, detail: null });

    commonUnitsGet.getUnitDetail(newParentId, databaseConnection, globalParameters, (error, newParentUnitDetail) =>
    {
      if(error != null) return callback(error);

      databaseManager.updateQuery(
      {
        databaseName: globalParameters.database.root.label,
        tableName: globalParameters.database.root.tables.units,
        args: { parent_unit: newParentId },
        where: { operator: '=', key: 'id', value: unitId }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
        
        return callback(null);
      });
    });
  });
}

/****************************************************************************************************/

module.exports =
{
  updateUnitParent: updateUnitParent
}

/****************************************************************************************************/