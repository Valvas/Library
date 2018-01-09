'use strict';

var params                     = require(`${__root}/json/config`);
var services                   = require(`${__root}/json/services`);
var constants                  = require(`${__root}/functions/constants`);
var databaseManager            = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getAccountRightsUsingUUID = (accountUUID, databaseConnector, callback) =>
{
  accountUUID       == undefined  ||
  databaseConnector == undefined  ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.rights,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'account', 'value': accountUUID } } }

  }, databaseConnector, (boolean, rightsOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      if(rightsOrErrorMessage.length == 0) callback({});

      else
      {
        var x = 0, rights = {};

        var loop = () =>
        {
          rights[rightsOrErrorMessage[x]['service']] = {};
          rights[rightsOrErrorMessage[x]['service']]['upload'] = rightsOrErrorMessage[x]['upload_files'];
          rights[rightsOrErrorMessage[x]['service']]['remove'] = rightsOrErrorMessage[x]['remove_files'];
          rights[rightsOrErrorMessage[x]['service']]['comment'] = rightsOrErrorMessage[x]['post_comments'];
          rights[rightsOrErrorMessage[x]['service']]['download'] = rightsOrErrorMessage[x]['download_files'];

          rightsOrErrorMessage[x += 1] == undefined ? callback(rights) : loop();
        }

        loop();
      }
    }
  });
}

/****************************************************************************************************/

module.exports.getAccountRightsForOneServiceUsingUUID = (accountUUID, service, databaseConnector, callback) =>
{
  if(accountUUID == undefined || service == undefined || databaseConnector == undefined) callback(false, 406, constants.MISSING_DATA_IN_REQUEST);

  else if(!(service in services)) callback(false, 404, constants.SERVICE_NOT_FOUND);

  else
  {
    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.rights,
      'args': { '0': '*' },
      'where': { 'AND': { '=': { '0': { 'key': 'account', 'value': accountUUID }, '1': { 'key': 'service', 'value': service } } } }
    
    }, databaseConnector, (boolean, rightsOrErrorMessage) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
    
      else
      {
        if(rightsOrErrorMessage.length == 0) callback({});
    
        else
        {
          var rights = {};
    
          rights['upload'] = rightsOrErrorMessage[0]['upload_files'];
          rights['remove'] = rightsOrErrorMessage[0]['remove_files'];
          rights['comment'] = rightsOrErrorMessage[0]['post_comments'];
          rights['download'] = rightsOrErrorMessage[0]['download_files'];
    
          callback(rights);
        }
      }
    });
  }
}

/****************************************************************************************************/