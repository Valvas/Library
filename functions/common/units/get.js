'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

function getUnits(databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, result); 
  });
}


/****************************************************************************************************/
/* GET UNITS IN A TREE VIEW */
/****************************************************************************************************/

function getUnitsTree(databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: { operator: '=', key: 'is_root', value: 1 }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var treeArray = [];

    treeArray.push(result[0].name);

    getUnitsTreeRetrieveCurrentUnitChildren(result[0].id, databaseConnection, globalParameters, (error, childrenArray) =>
    {
      treeArray.push(childrenArray);

      return callback(error, treeArray);
    }); 
  });
}

/****************************************************************************************************/

function getUnitsTreeRetrieveCurrentUnitChildren(currentUnitId, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: { operator: '=', key: 'parent_unit', value: currentUnitId }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var childrenArray = [];

    var index = 0;

    var browseFoundUnits = () =>
    {
      childrenArray.push(result[index].name);

      getUnitsTreeRetrieveCurrentUnitChildren(result[index].id, databaseConnection, globalParameters, (error, resultArray) =>
      {
        if(error != null) return callback(error);

        if(resultArray.length > 0) childrenArray.push(resultArray);

        if(result[index += 1] == undefined) return callback(null, childrenArray);

        browseFoundUnits();
      });
    }

    browseFoundUnits();
  });
}

/****************************************************************************************************/
/* GET ACCOUNT UNIT */
/****************************************************************************************************/

function getAccountUnit(accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.unitsMembers,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return result.length === 0 ? callback(null, false) : callback(null, true, result[0].unit_id);
  });
}

/****************************************************************************************************/

module.exports =
{
  getUnits: getUnits,
  getUnitsTree: getUnitsTree,
  getAccountUnit: getAccountUnit
}

/****************************************************************************************************/