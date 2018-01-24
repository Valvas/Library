'use strict';

var params                    = require(`${__root}/json/config`);
var constants                 = require(`${__root}/functions/constants`);
var reportsLogs               = require(`${__root}/functions/reports/logs`);
var databaseManager           = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.updateReportStatus = (reportUUID, reportStatus, accountID, databaseConnector, callback) =>
{
  if(reportUUID == undefined || reportStatus == undefined) callback(false, 406, constants.MISSING_DATA_IN_REQUEST);

  else
  {
    reportStatus != 2 && reportStatus != 3 && reportStatus != 4 ? callback(false, 406, constants.REPORT_STATUS_INCORRECT) :

    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.reports,
      'args': { '0': 'id' },
      'where': { '=': { '0': { 'key': 'uuid', 'value': reportUUID } } }

    }, databaseConnector, (boolean, reportOrErrorMessage) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

      else
      {
        reportOrErrorMessage.length == 0 ? callback(false, 404, constants.REPORT_NOT_FOUND) :

        databaseManager.updateQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.reports,
          'args': { 'report_status': reportStatus },
          'where': { '=': { '0': { 'key': 'id', 'value': reportOrErrorMessage[0].id } } }

        }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

          else
          {
            updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.REPORT_STATUS_NOT_UPDATED) :

            reportsLogs.createNewLog(accountID, reportStatus, reportOrErrorMessage[0].id, databaseConnector, (boolean, errorStatus, errorCode) =>
            {
              boolean ? callback(true) : callback(false, errorStatus, errorCode);
            });
          }
        });
      }
    });
  }
}

/****************************************************************************************************/