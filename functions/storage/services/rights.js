'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const accountsGet         = require(`${__root}/functions/accounts/get`);
const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getRightsTowardsServices = (accountID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    databaseManager.selectQuery(
    {
      'databaseName': params.database.storage.label,
      'tableName': params.database.storage.tables.rights,
      'args': { '0': '*' },
      'where': { '=': { '0': { 'key': 'account', 'value': accountID } } }
  
    }, databaseConnector, (boolean, rightsOrErrorMessage) =>
    {
      if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: rightsOrErrorMessage });

      else
      {
        var x = 0;
        var rightsObject = {};

        var loop = () =>
        {
          rightsObject[rightsOrErrorMessage[x].service] = {};
          rightsObject[rightsOrErrorMessage[x].service].remove      = rightsOrErrorMessage[x].remove_files;
          rightsObject[rightsOrErrorMessage[x].service].upload      = rightsOrErrorMessage[x].upload_files;
          rightsObject[rightsOrErrorMessage[x].service].comment     = rightsOrErrorMessage[x].post_comments;
          rightsObject[rightsOrErrorMessage[x].service].download    = rightsOrErrorMessage[x].download_files;
 
          rightsOrErrorMessage[x += 1] == undefined ? callback(null, rightsObject) : loop();
        }

        rightsOrErrorMessage.length == 0 ? callback(null, rightsObject) : loop();
      }
    });
  });
}

/****************************************************************************************************/

module.exports.getRightsTowardsService = (service, accountID, databaseConnector, callback) =>
{
  service             == undefined ||
  accountID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    error != null ? callback(error) :

    databaseManager.selectQuery(
    {
      'databaseName': params.database.storage.label,
      'tableName': params.database.storage.tables.rights,
      'args': { '0': '*' },
      'where': { 'AND': { '=': { '0': { 'key': 'account', 'value': accountID }, '1': { 'key': 'service', 'value': service } } } }
  
    }, databaseConnector, (boolean, rightsOrErrorMessage) =>
    {
      if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: rightsOrErrorMessage });

      else if(boolean == true && rightsOrErrorMessage.length == 0) callback({ status: 404, code: constants.SERVICE_NOT_FOUND });

      else
      {
        var rightsObject = {};

        rightsObject.service     = rightsOrErrorMessage[0].service;
        rightsObject.remove      = rightsOrErrorMessage[0].remove_files;
        rightsObject.upload      = rightsOrErrorMessage[0].upload_files;
        rightsObject.comment     = rightsOrErrorMessage[0].post_comments;
        rightsObject.download    = rightsOrErrorMessage[0].download_files;

        callback(null, rightsObject);
      }
    });
  });
}

/****************************************************************************************************/