'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

function checkIfAccountHasAccessToTheApp(accountUuid, databaseConnection, globalParameters, callback)
{
  if(accountUuid == undefined)        return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'accountUuid' });
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.sick.label,
    tableName: globalParameters.database.sick.tables.accountsList,
    args: [ '*' ],
    where: { operator: '=', key: 'account_uuid', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true);
  });
}

/****************************************************************************************************/

function getAccountsThatHaveAccessToTheApp(databaseConnection, globalParameters, callback)
{
  if(globalParameters == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.sick.label,
    tableName: globalParameters.database.sick.tables.accountsList,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var accounts = [];

    result.forEach(element => { accounts.push(element.account_uuid) });

    return callback(null, accounts);
  });
}

/****************************************************************************************************/

module.exports =
{
  checkIfAccountHasAccessToTheApp: checkIfAccountHasAccessToTheApp,
  getAccountsThatHaveAccessToTheApp: getAccountsThatHaveAccessToTheApp
}
