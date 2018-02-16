'use strict'

var params              = require(`${__root}/json/config`);
var constants           = require(`${__root}/functions/constants`);
var databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getMembersForEachService = (databaseConnector, callback) =>
{
  databaseConnector == undefined ? callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
    'args': { '0': '*' },
    'where': {  }
    
  }, databaseConnector, (boolean, accountsOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: accountsOrErrorMessage });

    else
    {
      var x = 0;
      var counterObject = {};

      var counterFilesLoop = () =>
      {
        if(counterObject[accountsOrErrorMessage[x].service] == undefined) counterObject[accountsOrErrorMessage[x].service] = 0;

        counterObject[accountsOrErrorMessage[x].service] += 1;

        accountsOrErrorMessage[x += 1] == undefined ? callback(null, counterObject) : counterFilesLoop();
      }

      accountsOrErrorMessage.length == 0 ? callback(null, counterObject) : counterFilesLoop();
    }
  });
}

/****************************************************************************************************/

module.exports.getPeopleWhoHaveAccessToEachService = (databaseConnector, callback) =>
{
  databaseConnector == undefined ? callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.rights,
    'args': { '0': '*' },
    'where': {  }
    
  }, databaseConnector, (boolean, accountsOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: accountsOrErrorMessage });

    else
    {
      var x = 0;
      var counterObject = {};

      var counterFilesLoop = () =>
      {
        if(counterObject[accountsOrErrorMessage[x].service] == undefined) counterObject[accountsOrErrorMessage[x].service] = 0;

        counterObject[accountsOrErrorMessage[x].service] += 1;

        accountsOrErrorMessage[x += 1] == undefined ? callback(null, counterObject) : counterFilesLoop();
      }

      accountsOrErrorMessage.length == 0 ? callback(null, counterObject) : counterFilesLoop();
    }
  });
}

/****************************************************************************************************/