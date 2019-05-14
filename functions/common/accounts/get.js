'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonUnitsGet      = require(`${__root}/functions/common/units/get`);

/****************************************************************************************************/

function checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, callback)
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.accounts,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, false);

    const accountData =
    {
      uuid: result[0].uuid,
      email: result[0].email,
      lastname: result[0].lastname,
      firstname: result[0].firstname,
      password: result[0].password,
      suspended: result[0].suspended === 1,
      picture: result[0].picture,
      contact_number: result[0].contact_number,
      is_admin: result[0].is_admin === 1
    }

    return callback(null, true, accountData);
  });
}

/****************************************************************************************************/

function checkIfAccountExistsFromEmail(accountEmail, databaseConnection, params, callback)
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(accountEmail == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountEmail' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.accounts,
    args: [ '*' ],
    where: { operator: '=', key: 'email', value: accountEmail }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length == 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

function getAllAccounts(databaseConnection, globalParameters, callback)
{
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.accounts,
    args: [ 'uuid', 'email', 'lastname', 'firstname', 'suspended', 'is_admin' ],
    where: {  },
    order: [ { column: 'lastname', asc: true } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, []);

    var accounts = [];

    for(var x = 0; x < result.length; x++)
    {
      accounts.push({ uuid: result[x].uuid, email: result[x].email, lastname: result[x].lastname, firstname: result[x].firstname, suspended: result[x].suspended === 1, admin: result[x].is_admin === 1, contactNumber: result[x].contact_number });
    }

    return callback(null, accounts);
  });
}

/****************************************************************************************************/

function getAllAccountsWithPictures(databaseConnection, globalParameters, callback)
{
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.accounts,
    args: [ '*' ],
    where: {  },
    order: [ { column: 'lastname', asc: true } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, []);

    var accounts = [];

    for(var x = 0; x < result.length; x++)
    {
      accounts.push({ uuid: result[x].uuid, email: result[x].email, lastname: result[x].lastname, firstname: result[x].firstname, suspended: result[x].suspended === 1, admin: result[x].is_admin === 1, picture: result[x].picture, contactNumber: result[x].contact_number });
    }

    return callback(null, accounts);
  });
}

/****************************************************************************************************/
/* GET ALL ACCOUNTS IN A TREE */
/****************************************************************************************************/

function getAccountsWithUnit(databaseConnection, globalParameters, callback)
{
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.units,
    args: [ '*' ],
    where: { operator: '=', key: 'is_root', value: 1 }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.DEFAULT_UNIT_NOT_FOUND, detail: null });

    const defaultUnit = result[0].id;

    getAccountsWithUnitBuildUnitsTree(defaultUnit, databaseConnection, globalParameters, (error, accounts) =>
    {
      return callback(error, accounts);
    });
  });
}

/****************************************************************************************************/

function getAccountsWithUnitBuildUnitsTree(defaultUnit, databaseConnection, globalParameters, callback)
{
  var unitsTree = {};

  unitsTree[defaultUnit] = '0';

  getAccountsWithUnitGetUnitChildren(unitsTree, defaultUnit, '0', databaseConnection, globalParameters, (error, unitsTree) =>
  {
    if(error != null) return callback(error);

    getAllAccountsWithPictures(databaseConnection, globalParameters, (error, accounts) =>
    {
      if(error != null) return callback(error);

      return getAccountsWithUnitBrowseAccounts(accounts, defaultUnit, unitsTree, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function getAccountsWithUnitGetUnitChildren(unitsTree, currentUnit, unitTag, databaseConnection, globalParameters, callback)
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

    if(result.length === 0) return callback(null, unitsTree);

    var index = 0;

    var browseUnitChildren = () =>
    {
      getAccountsWithUnitGetUnitChildren(unitsTree, result[index].id, `${unitTag}${index}`, databaseConnection, globalParameters, (error) =>
      {
        if(error != null) return callback(error);

        unitsTree[result[index].id] = `${unitTag}${index}`;

        if(result[index += 1] == undefined) return callback(null, unitsTree);

        browseUnitChildren();
      });
    }

    browseUnitChildren();
  });
}

/****************************************************************************************************/

function getAccountsWithUnitBrowseAccounts(accounts, defaultUnit, unitsTree, databaseConnection, globalParameters, callback)
{
  var index = 0;

  var browseAccounts = () =>
  {
    commonUnitsGet.getAccountUnit(accounts[index].uuid, databaseConnection, globalParameters, (error, unitData) =>
    {
      if(error != null) return callback(error);

      var accountUnit = unitsTree[unitData.id];

      accounts[index].unitTags = [];
      accounts[index].unitName = unitData.name;

      while(accountUnit.length > 0)
      {
        accounts[index].unitTags.push(accountUnit);
        accountUnit = accountUnit.slice(0, -1);
      }

      if(accounts[index += 1] == undefined) return callback(null, accounts);

      browseAccounts();
    });
  }

  browseAccounts();
}

/****************************************************************************************************/

module.exports =
{
  getAllAccounts: getAllAccounts,
  getAccountsWithUnit: getAccountsWithUnit,
  getAllAccountsWithPictures: getAllAccountsWithPictures,
  checkIfAccountExistsFromUuid: checkIfAccountExistsFromUuid,
  checkIfAccountExistsFromEmail: checkIfAccountExistsFromEmail
}

/****************************************************************************************************/
