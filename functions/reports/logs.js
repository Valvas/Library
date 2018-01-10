'use strict';

var params                    = require(`${__root}/json/config`);
var constants                 = require(`${__root}/functions/constants`);
var databaseManager           = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.createNewLog = (accountID, type, reportID, databaseConnector, callback) =>
{
  accountID == undefined || type == undefined || reportID == undefined || databaseConnector == undefined ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.insertQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.report_logs,
      
    'uuid': false,
      
    'args':
    {
      'date': Date.now(),
      'account': accountID,
      'type': type,
      'report': reportID
    }
  }, databaseConnector, (boolean, idOrErrorMessage) =>
  {
    boolean == false ? callback(false, 500, constants.SQL_SERVER_ERROR) : callback(true);
  });
}

/****************************************************************************************************/