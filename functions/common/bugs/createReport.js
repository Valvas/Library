'use strict'

const uuid              = require('uuid');
const constants         = require(`${__root}/functions/constants`);
const commonFormatDate  = require(`${__root}/functions/common/format/date`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* CREATE A BUG REPORT */
/****************************************************************************************************/

function createReport(reportMessage, accountData, databaseConnection, globalParameters, callback)
{
  if(reportMessage.length === 0)
  {
    return callback({ status: 406, code: constants.BUG_REPORT_EMPTY_MESSAGE, detail: null });
  }

  const generatedUuid = uuid.v4();
  const currentTimestamp = Date.now();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.bugReports,
    args: { uuid: generatedUuid, date: currentTimestamp, creator: accountData.uuid, message: reportMessage.replace(/\"/g, '\\"'), pending: 1, resolved: 0, closed: 0 }

  }, databaseConnection, (error) =>
  {
    if(error != null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    commonFormatDate.getStringifyDateFromTimestamp(currentTimestamp, (error, stringifiedDate) =>
    {
      if(error != null)
      {
        return callback(error);
      }

      const currentReport =
      {
        uuid: generatedUuid,
        date: stringifiedDate,
        creator: `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1)} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1)}`,
        message: reportMessage,
        pending: true,
        resolved: false,
        closed: false
      }

      return callback(null, currentReport);
    });
  });
}

/****************************************************************************************************/

module.exports =
{
  createReport: createReport
}

/****************************************************************************************************/