'use strict';

var params                    = require(`${__root}/json/config`);
var constants                 = require(`${__root}/functions/constants`);
var accountsGet               = require(`${__root}/functions/accounts/get`);
var reportsLogs               = require(`${__root}/functions/reports/logs`);
var databaseManager           = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.createNewReport = (reportType, reportSubject, reportContent, accountUUID, databaseConnector, callback) =>
{
  reportType == undefined || reportSubject == undefined || reportContent == undefined || accountUUID == undefined || databaseConnector == undefined ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.insertQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.reports,
  
    'uuid': true,
  
    'args':
    {
      'report_type': reportType,
      'report_subject': reportSubject.replace(/"/g, '\\"'),
      'report_content': reportContent.replace(/"/g, '\\"'),
      'report_account': accountUUID,
      'report_date': Date.now(),
      'report_status': 2
    }
  }, databaseConnector, (boolean, reportIdOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      accountsGet.getAccountUsingUUID(accountUUID, databaseConnector, (accountOrFalse, errorStatus, errorCode) =>
      {
        accountOrFalse == false ? callback(false, errorStatus, errorCode) :

        reportsLogs.createNewLog(accountOrFalse.id, 0, reportIdOrErrorMessage, databaseConnector, (boolean, errorStatus, errorCode) =>
        {
          boolean ? callback(true) : callback(false, errorStatus, errorCode);
        });
      });
    }
  });
}

/****************************************************************************************************/