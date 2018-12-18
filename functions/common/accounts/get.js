'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.checkIfAccountExistsFromUuid = (accountUuid, databaseConnection, params, callback) =>
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

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/

module.exports.checkIfAccountExistsFromEmail = (accountEmail, databaseConnection, params, callback) =>
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

module.exports.getAllAccounts = (databaseConnection, globalParameters, callback) =>
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
      accounts.push({ uuid: result[x].uuid, email: result[x].email, lastname: result[x].lastname, firstname: result[x].firstname, suspended: result[x].suspended === 1, admin: result[x].is_admin === 1 });
    }

    return callback(null, accounts);
  });
}

/****************************************************************************************************/

module.exports.getAllAccountsWidthPictures = (databaseConnection, globalParameters, callback) =>
{
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.accounts,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, []);

    var accounts = [];

    for(var x = 0; x < result.length; x++)
    {
      accounts.push({ uuid: result[x].uuid, email: result[x].email, lastname: result[x].lastname, firstname: result[x].firstname, suspended: result[x].suspended === 1, admin: result[x].is_admin === 1, picture: result[x].picture });
    }

    accounts.sort((a, b) =>
    {
      if(a.lastname.localeCompare(b, 'fr', {ignorePunctuation: true}) < 0) return -1;
      if(a.lastname.localeCompare(b, 'fr', {ignorePunctuation: true}) > 0) return 1;
      return 0;
    });

    return callback(null, accounts);
  });
}

/****************************************************************************************************/