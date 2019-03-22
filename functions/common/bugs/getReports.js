'use strict'

const commonStrings     = require(`${__root}/json/strings/common`);

const constants         = require(`${__root}/functions/constants`);
const commonFormatDate  = require(`${__root}/functions/common/format/date`);
const commonAccountsGet = require(`${__root}/functions/common/accounts/get`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* GET REPORTS LIST */
/****************************************************************************************************/

function getReportsList(databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.bugReports,
    args: [ '*' ],
    where: {  },
    order: [ { column: 'date', asc: false } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var index = 0, reportsList = [];

    const browseReports = () =>
    {
      commonFormatDate.getStringifyDateFromTimestamp(result[index].date, (error, stringifiedDate) =>
      {
        if(error != null) return callback(error);

        commonAccountsGet.checkIfAccountExistsFromUuid(result[index].creator, databaseConnection, globalParameters, (error, accountExists, accountData) =>
        {
          if(error != null) return callback(error);

          const currentReport =
          {
            uuid: result[index].uuid,
            date: stringifiedDate,
            creator: accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1)} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1)}` : null,
            message: result[index].message,
            pending: result[index].pending === 1,
            resolved: result[index].resolved === 1,
            closed: result[index].closed === 1
          }

          reportsList.push(currentReport);

          if(result[index += 1] == undefined) return callback(null, reportsList);

          browseReports();
        });
      });
    }

    browseReports();
  });
}

/****************************************************************************************************/
/* GET REPORT DETAIL AND LOGS */
/****************************************************************************************************/

function getReportDetail(reportUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.bugReports,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: reportUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.BUG_REPORT_NOT_FOUND, detail: null });

    getReportDetailFormatData(result[0], databaseConnection, globalParameters, (error, reportDetail) =>
    {
      return callback(error, reportDetail);
    });
  });
}

/****************************************************************************************************/

function getReportDetailFormatData(reportData, databaseConnection, globalParameters, callback)
{
  commonFormatDate.getStringifyDateFromTimestamp(reportData.date, (error, stringifiedDate) =>
  {
    if(error != null) return callback(error);

    commonAccountsGet.checkIfAccountExistsFromUuid(reportData.creator, databaseConnection, globalParameters, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      const currentReport =
      {
        uuid: reportData.uuid,
        date: stringifiedDate,
        creator: accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1)} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1)}` : null,
        message: reportData.message,
        pending: reportData.pending === 1,
        resolved: reportData.resolved === 1,
        closed: reportData.closed === 1,
        logs: []
      }

      return getReportDetailRetrieveLogs(currentReport, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function getReportDetailRetrieveLogs(reportDetail, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.bugLogs,
    args: [ '*' ],
    where: { operator: '=', key: 'bug', value: reportDetail.uuid },
    order: [ { column: 'date', asc: false } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, reportDetail);

    var index = 0;

    const browseLogs = () =>
    {
      getReportDetailFormatLog(result[index], databaseConnection, globalParameters, (error, formatedLog) =>
      {
        if(error != null) return callback(error);

        reportDetail.logs.push(formatedLog);

        if(result[index += 1] == undefined) return callback(null, reportDetail);

        browseLogs();
      });
    }

    browseLogs();
  });
}

/****************************************************************************************************/

function getReportDetailFormatLog(currentLog, databaseConnection, globalParameters, callback)
{
  commonFormatDate.getStringifyDateFromTimestamp(currentLog.date, (error, stringifiedDate) =>
  {
    if(error != null) return callback(error);

    commonAccountsGet.checkIfAccountExistsFromUuid(currentLog.account, databaseConnection, globalParameters, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      const currentLogMessage = currentLog.comment === 1
      ? currentLog.message
      : currentLog.pending === 1
        ? commonStrings.root.bugs.logs.pendingMessage
        : currentLog.resolved === 1
          ? commonStrings.root.bugs.logs.resolvedMessage
          : commonStrings.root.bugs.logs.closedMessage;

      const logData =
      {
        date: stringifiedDate,
        creator: accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1)} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1)}` : null,
        comment: currentLog.comment === 1,
        pending: currentLog.pending === 1,
        resolved: currentLog.resolved === 1,
        closed: currentLog.closed === 1,
        message: currentLogMessage
      }

      return callback(null, logData);
    });
  });
}

/****************************************************************************************************/

module.exports =
{
  getReportsList: getReportsList,
  getReportDetail: getReportDetail
}

/****************************************************************************************************/
