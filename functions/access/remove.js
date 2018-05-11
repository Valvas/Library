'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.removeAccess = (appName, accountID, databaseConnector, callback) =>
{
  var queryObject = {};

  queryObject.databaseName = params.database.root.label;
  queryObject.tableName = params.database.root.tables.access;

  queryObject.args = {};

  queryObject.args[appName] = 0;

  queryObject.where = { '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID } } };

  databaseManager.updateQuery(queryObject, databaseConnector, (boolean, errorMessage) =>
  {
    if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });
    
    if(appName == 'admin')
    {
      databaseManager.deleteQuery(
      {
        'databaseName': params.database.administration.label,
        'tableName': params.database.administration.tables.rights,
        'where': { '0': { 'operator': '=', '0': { 'key': 'account', 'value': accountID } } }

      }, databaseConnector, (boolean, errorMessage) =>
      {
        if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

        return callback(null);
      });
    }

    else
    {
      return callback(null);
    }
  });
}

/****************************************************************************************************/