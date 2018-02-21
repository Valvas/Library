'use strict';

var params                     = require(`${__root}/json/config`);
var services                   = require(`${__root}/json/services`);
var constants                  = require(`${__root}/functions/constants`);
var databaseManager            = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getMembers = (service, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'service', 'value': service } } }

  }, databaseConnector, (boolean, membersOrErrorMessage) =>
  {
    boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: membersOrErrorMessage }) : callback(null, membersOrErrorMessage);
  });
}

/****************************************************************************************************/

module.exports.getAccessMembers = (service, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.rights,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'service', 'value': service } } }

  }, databaseConnector, (boolean, rightsOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: rightsOrErrorMessage });

    else if(boolean == true && rightsOrErrorMessage.length == 0) callback(null, {});

    else
    {
      var x = 0;
      var accessMembers = {};

      var getAccountsFromRightsLoop = () =>
      {
        databaseManager.selectQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,
          'args': { '0': '*' },
          'where': { '=': { '0': { 'key': 'uuid', 'value': rightsOrErrorMessage[x].account } } }
      
        }, databaseConnector, (boolean, memberOrErrorMessage) =>
        {
          if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: memberOrErrorMessage });

          else if(boolean == true && memberOrErrorMessage.length == 0)
          {
            rightsOrErrorMessage[x += 1] == undefined ? callback(null, accessMembers): getAccountsFromRightsLoop();
          }

          else
          {
            accessMembers[x] = {};

            accessMembers[x].account = memberOrErrorMessage[0];
            accessMembers[x].rights = rightsOrErrorMessage[x];

            rightsOrErrorMessage[x += 1] == undefined ? callback(null, accessMembers): getAccountsFromRightsLoop();
          }
        });
      }

      getAccountsFromRightsLoop();
    }
  });
}

/****************************************************************************************************/