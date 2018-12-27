'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* CHECK IF UNIT EXISTS */
/****************************************************************************************************/

function checkIfUnitExists(unitId, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: { operator: '=', key: 'id', value: unitId }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, false);

    const unitDetail = { unitId: result[0].id, unitName: result[0].name, unitParent: result[0].parent_unit };

    return callback(null, true, unitDetail);
  });
}

/****************************************************************************************************/
/* GET ALL UNITS */
/****************************************************************************************************/

function getUnits(databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: {  },
    order: [ { column: 'name', asc: true } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var index = 0, unitsArray = [];

    var browseUnitsLoop = () =>
    {
      var unitParent = null;

      for(var x = 0; x < result.length; x++)
      {
        if(result[x].id === result[index].parent_unit) unitParent = { parentId: result[x].id, parentName: result[x].name };
      }

      getUnitsGetChildren(result[index].id, databaseConnection, globalParameters, (error, childrenArray) =>
      {
        if(error != null) return callback(error);

        unitsArray.push({ unitId: result[index].id, unitName: result[index].name, unitParent: unitParent, unitChildren: childrenArray });

        if(result[index += 1] == undefined) return callback(null, unitsArray);

        browseUnitsLoop();
      });
    }

    browseUnitsLoop();
  });
}

/****************************************************************************************************/

function getUnitsGetChildren(currentUnit, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: { operator: '=', key: 'parent_unit', value: currentUnit }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var index = 0, childrenArray = [];

    var browseChildren = () =>
    {
      childrenArray.push(result[index].id);

      getUnitsGetChildren(result[index].id, databaseConnection, globalParameters, (error, currentUnitChildren) =>
      {
        if(error != null) return callback(error);

        for(var x = 0; x < currentUnitChildren.length; x++) childrenArray.push(currentUnitChildren[x]);

        if(result[index += 1] == undefined) return callback(null, childrenArray);

        browseChildren();
      });
    }

    browseChildren();
  });
}

/****************************************************************************************************/
/* GET UNIT DETAILS */
/****************************************************************************************************/

function getUnitDetail(unitId, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: { operator: '=', key: 'id', value: unitId }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.UNIT_NOT_FOUND, detail: null });

    getUnitsGetChildren(result[0].id, databaseConnection, globalParameters, (error, childrenArray) =>
    {
      if(error != null) return callback(error);

      const unitDetail = { unitId: result[0].id, unitName: result[0].name, unitParent: result[0].parent_unit, unitChildren: childrenArray };

      return callback(null, unitDetail);
    });
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

    if(result.length === 0)
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
    
        if(result.length === 0) return callback({ status: 404, code: constants.UNIT_NOT_FOUND, detail: null });
    
        return callback(null, result[0]);
      });
    }

    else
    {
      databaseManager.selectQuery(
      {
        databaseName: globalParameters.database.root.label,
        tableName: globalParameters.database.root.tables.units,
        args: [ '*' ],
        where: { operator: '=', key: 'id', value: result[0].unit_id }
    
      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    
        if(result.length === 0) return callback({ status: 404, code: constants.UNIT_NOT_FOUND, detail: null });
    
        return callback(null, result[0]);
      });
    }
  });
}

/****************************************************************************************************/

module.exports =
{
  getUnits: getUnits,
  getUnitsTree: getUnitsTree,
  getUnitDetail: getUnitDetail,
  getAccountUnit: getAccountUnit,
  checkIfUnitExists: checkIfUnitExists
}

/****************************************************************************************************/