'use strict'

const constants             = require(`${__root}/functions/constants`);
const commonFormatDate      = require(`${__root}/functions/common/format/date`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);
const commonBugsGetReports  = require(`${__root}/functions/common/bugs/getReports`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/
/* POST A NEW COMMENT ON A REPORT */
/****************************************************************************************************/

function updateReportPostComment(reportComment, reportUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const correctedComment = reportComment.trim();
  const generatedDate = Date.now();

  if(correctedComment.length === 0)
  {
    return callback({ status: 406, code: constants.BUG_REPORT_EMPTY_COMMENT, detail: null });
  }

  commonBugsGetReports.getReportExists(reportUuid, databaseConnection, globalParameters, (error, reportExists) =>
  {
    if(reportExists === false)
    {
      return callback({ status: 404, code: constants.BUG_REPORT_NOT_FOUND, detail: null });
    }

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.bugLogs,
      args: { date: generatedDate, account: accountUuid, comment: 1, pending: 0, resolved: 0, closed: 0, message: reportComment.replace(/\"/g, '\\"'), report: reportUuid }

    }, databaseConnection, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
      }

      updateReportSetNotifications(reportUuid, databaseConnection, globalParameters, (error) =>
      {
        if(error !== null)
        {
          return callback(error);
        }

        updateReportFormatData(generatedDate, accountUuid, databaseConnection, globalParameters, (error, stringifiedDate, stringifiedCreator) =>
        {
          if(error !== null)
          {
            return callback(error);
          }

          const logData =
          {
            report: reportUuid,
            closed: false,
            comment: true,
            creator: stringifiedCreator,
            date: stringifiedDate,
            message: reportComment,
            pending: false,
            resolved: false
          }

          return callback(null, logData);
        });
      });
    });
  });
}

/****************************************************************************************************/
/* SET REPORT TO CLOSED */
/****************************************************************************************************/

function updateReportSetToClosed(reportUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const generatedDate = Date.now();

  commonBugsGetReports.getReportExists(reportUuid, databaseConnection, globalParameters, (error, reportExists) =>
  {
    if(reportExists === false)
    {
      return callback({ status: 404, code: constants.BUG_REPORT_NOT_FOUND, detail: null });
    }

    databaseManager.updateQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.bugReports,
      args: { pending: 0, resolved: 0, closed: 1 },
      where: { operator: '=', key: 'uuid', value: reportUuid }

    }, databaseConnection, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
      }

      databaseManager.insertQuery(
      {
        databaseName: globalParameters.database.root.label,
        tableName: globalParameters.database.root.tables.bugLogs,
        args: { date: generatedDate, account: accountUuid, comment: 0, pending: 0, resolved: 0, closed: 1, report: reportUuid, message: '' }

      }, databaseConnection, (error) =>
      {
        if(error !== null)
        {
          return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
        }

        updateReportSetNotifications(reportUuid, databaseConnection, globalParameters, (error) =>
        {
          if(error !== null)
          {
            return callback(error);
          }

          updateReportFormatData(generatedDate, accountUuid, databaseConnection, globalParameters, (error, stringifiedDate, stringifiedCreator) =>
          {
            if(error !== null)
            {
              return callback(error);
            }

            const logData =
            {
              report: reportUuid,
              closed: true,
              comment: false,
              creator: stringifiedCreator,
              date: stringifiedDate,
              message: null,
              pending: false,
              resolved: false
            }

            return callback(null, logData);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/
/* SET REPORT TO RESOLVED */
/****************************************************************************************************/

function updateReportSetToResolved(reportUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const generatedDate = Date.now();

  commonBugsGetReports.getReportExists(reportUuid, databaseConnection, globalParameters, (error, reportExists) =>
  {
    if(reportExists === false)
    {
      return callback({ status: 404, code: constants.BUG_REPORT_NOT_FOUND, detail: null });
    }

    databaseManager.updateQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.bugReports,
      args: { pending: 0, resolved: 1, closed: 0 },
      where: { operator: '=', key: 'uuid', value: reportUuid }

    }, databaseConnection, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
      }

      databaseManager.insertQuery(
      {
        databaseName: globalParameters.database.root.label,
        tableName: globalParameters.database.root.tables.bugLogs,
        args: { date: generatedDate, account: accountUuid, comment: 0, pending: 0, resolved: 1, closed: 0, report: reportUuid, message: '' }

      }, databaseConnection, (error) =>
      {
        if(error !== null)
        {
          return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
        }

        updateReportSetNotifications(reportUuid, databaseConnection, globalParameters, (error) =>
        {
          if(error !== null)
          {
            return callback(error);
          }

          updateReportFormatData(generatedDate, accountUuid, databaseConnection, globalParameters, (error, stringifiedDate, stringifiedCreator) =>
          {
            if(error !== null)
            {
              return callback(error);
            }

            const logData =
            {
              report: reportUuid,
              closed: false,
              comment: false,
              creator: stringifiedCreator,
              date: stringifiedDate,
              message: null,
              pending: false,
              resolved: true
            }

            return callback(null, logData);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/
/* SET REPORT TO PENDING */
/****************************************************************************************************/

function updateReportSetToPending(reportUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const generatedDate = Date.now();

  commonBugsGetReports.getReportExists(reportUuid, databaseConnection, globalParameters, (error, reportExists) =>
  {
    if(reportExists === false)
    {
      return callback({ status: 404, code: constants.BUG_REPORT_NOT_FOUND, detail: null });
    }

    databaseManager.updateQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.bugReports,
      args: { pending: 1, resolved: 0, closed: 0 },
      where: { operator: '=', key: 'uuid', value: reportUuid }

    }, databaseConnection, (error) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
      }

      databaseManager.insertQuery(
      {
        databaseName: globalParameters.database.root.label,
        tableName: globalParameters.database.root.tables.bugLogs,
        args: { date: generatedDate, account: accountUuid, comment: 0, pending: 1, resolved: 0, closed: 0, report: reportUuid, message: '' }

      }, databaseConnection, (error) =>
      {
        if(error !== null)
        {
          return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
        }

        updateReportSetNotifications(reportUuid, databaseConnection, globalParameters, (error) =>
        {
          if(error !== null)
          {
            return callback(error);
          }

          updateReportFormatData(generatedDate, accountUuid, databaseConnection, globalParameters, (error, stringifiedDate, stringifiedCreator) =>
          {
            if(error !== null)
            {
              return callback(error);
            }

            const logData =
            {
              report: reportUuid,
              closed: false,
              comment: false,
              creator: stringifiedCreator,
              date: stringifiedDate,
              message: null,
              pending: true,
              resolved: false
            }

            return callback(null, logData);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/
/* UPDATE REPORT NOTIFICATIONS */
/****************************************************************************************************/

function updateReportSetNotifications(reportUuid, databaseConnection, globalParameters, callback)
{
  let index = 0;
  let accountsList = null;

  const browseAccounts = (currentAccount) =>
  {
    databaseManager.selectQuery(
    {
      databaseName: globalParameters.database.root.label,
      tableName: globalParameters.database.root.tables.bugNotifications,
      args: [ 'amount' ],
      where: { condition: 'AND', 0: { operator: '=', key: 'report', value: reportUuid }, 1: { operator: '=', key: 'account', value: currentAccount.uuid } }

    }, databaseConnection, (error, result) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
      }

      if(result.length === 0)
      {
        databaseManager.insertQuery(
        {
          databaseName: globalParameters.database.root.label,
          tableName: globalParameters.database.root.tables.bugNotifications,
          args: { account: currentAccount.uuid, report: reportUuid, amount: 1 }

        }, databaseConnection, (error) =>
        {
          if(error !== null)
          {
            return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
          }

          if(accountsList[index += 1] === undefined)
          {
            return callback(null);
          }

          browseAccounts(accountsList[index]);
        });
      }

      else
      {
        databaseManager.updateQuery(
        {
          databaseName: globalParameters.database.root.label,
          tableName: globalParameters.database.root.tables.bugNotifications,
          args: { amount: (parseInt(result[0].amount) + 1) },
          where: { condition: 'AND', 0: { operator: '=', key: 'report', value: reportUuid }, 1: { operator: '=', key: 'account', value: currentAccount.uuid } }

        }, databaseConnection, (error) =>
        {
          if(error !== null)
          {
            return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
          }

          if(accountsList[index += 1] === undefined)
          {
            return callback(null);
          }

          browseAccounts(accountsList[index]);
        });
      }
    });
  }

  commonAccountsGet.getAllAccounts(databaseConnection, globalParameters, (error, accounts) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    if(accounts.length === 0)
    {
      return callback(null);
    }

    accountsList = accounts;

    browseAccounts(accountsList[index]);
  });
}

/****************************************************************************************************/
/* FORMAT NEW LOG DATA */
/****************************************************************************************************/

function updateReportFormatData(logDate, logCreator, databaseConnection, globalParameters, callback)
{
  commonFormatDate.getStringifyDateFromTimestamp(logDate, (error, stringifiedDate) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    commonAccountsGet.checkIfAccountExistsFromUuid(logCreator, databaseConnection, globalParameters, (error, accountExists, accountData) =>
    {
      if(error !== null)
      {
        return callback(error);
      }

      if(accountExists === false)
      {
        return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });
      }

      return callback(null, stringifiedDate, `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1)} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1)}`);
    });
  });
}

/****************************************************************************************************/

module.exports =
{
  updateReportPostComment: updateReportPostComment,
  updateReportSetToClosed: updateReportSetToClosed,
  updateReportSetToPending: updateReportSetToPending,
  updateReportSetToResolved: updateReportSetToResolved
}

/****************************************************************************************************/
