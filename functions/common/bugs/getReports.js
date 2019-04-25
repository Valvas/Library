'use strict'

const commonStrings     = require(`${__root}/json/strings/common`);

const constants         = require(`${__root}/functions/constants`);
const commonFormatDate  = require(`${__root}/functions/common/format/date`);
const commonAccountsGet = require(`${__root}/functions/common/accounts/get`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* GET REPORTS LIST */
/****************************************************************************************************/

function getReportsList(accountUuid, databaseConnection, globalParameters, callback)
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
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return callback(null, []);
    }

    let index = 0, reportsList = [];

    const browseReports = () =>
    {
      getReportsListFormatCurrentReport(result[index], accountUuid, databaseConnection, globalParameters, (error, currentReport) =>
      {
        if(error !== null)
        {
          return callback(error);
        }

        reportsList.push(currentReport);

        if(result[index += 1] === undefined)
        {
          return callback(null, reportsList);
        }

        browseReports();
      });
    }

    browseReports();
  });
}

/****************************************************************************************************/

function getReportsListFormatCurrentReport(currentReportData, accountUuid, databaseConnection, globalParameters, callback)
{
  commonFormatDate.getStringifiedDateTimeFromTimestampAsync(currentReportData.date, (error, stringifiedDate) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    commonAccountsGet.checkIfAccountExistsFromUuid(currentReportData.creator, databaseConnection, globalParameters, (error, accountExists, accountData) =>
    {
      if(error !== null)
      {
        return callback(error);
      }

      getReportsListCheckNotifications(currentReportData.uuid, accountUuid, databaseConnection, globalParameters, (error, unseenNotifications) =>
      {
        if(error !== null)
        {
          return callback(error);
        }

        const currentReport =
        {
          uuid: currentReportData.uuid,
          date: stringifiedDate,
          creator: accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1)} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1)}` : null,
          message: currentReportData.message,
          pending: currentReportData.pending === 1,
          resolved: currentReportData.resolved === 1,
          closed: currentReportData.closed === 1,
          unseenNotifications: unseenNotifications
        }

        return callback(null, currentReport);
      });
    });
  });
}

/****************************************************************************************************/

function getReportsListCheckNotifications(currentReportUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.bugNotifications,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'report', value: currentReportUuid }, 1: { operator: '=', key: 'account', value: accountUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return callback(null, false);
    }

    return callback(null, result[0].amount > 0);
  });
}

/****************************************************************************************************/
/* GET REPORT DETAIL AND LOGS */
/****************************************************************************************************/

function getReportDetail(reportUuid, accountUuid, databaseConnection, globalParameters, callback)
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

    getReportDetailFormatData(result[0], accountUuid, databaseConnection, globalParameters, (error, reportDetail) =>
    {
      return callback(error, reportDetail);
    });
  });
}

/****************************************************************************************************/

function getReportDetailFormatData(reportData, accountUuid, databaseConnection, globalParameters, callback)
{
  commonFormatDate.getStringifiedDateTimeFromTimestampAsync(reportData.date, (error, stringifiedDate) =>
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

      return getReportDetailResetNotifications(currentReport, accountUuid, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function getReportDetailResetNotifications(currentReport, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.bugNotifications,
    args: { amount: 0 },
    where: { condition: 'AND', 0: { operator: '=', key: 'report', value: currentReport.uuid }, 1: { operator: '=', key: 'account', value: accountUuid } }

  }, databaseConnection, (error) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    return getReportDetailRetrieveLogs(currentReport, databaseConnection, globalParameters, callback);
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
    where: { operator: '=', key: 'report', value: reportDetail.uuid },
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
  commonFormatDate.getStringifiedDateTimeFromTimestampAsync(currentLog.date, (error, stringifiedDate) =>
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
/* CHECK IF A REPORT EXISTS */
/****************************************************************************************************/

function getReportExists(reportUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.bugReports,
    args: [ 'uuid' ],
    where: { operator: '=', key: 'uuid', value: reportUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    return callback(null, result.length > 0);
  });
}

/****************************************************************************************************/

module.exports =
{
  getReportsList: getReportsList,
  getReportDetail: getReportDetail,
  getReportExists: getReportExists
}

/****************************************************************************************************/
