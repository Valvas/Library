'use strict'

const uuid                  = require('uuid');

const constants             = require(`${__root}/functions/constants`);
const databaseManager       = require(`${__root}/functions/database/MySQLv3`);
const commonFilesMove       = require(`${__root}/functions/common/files/move`);
const commonFormatDate      = require(`${__root}/functions/common/format/date`);
const stoppageCreateFolders = require(`${__root}/functions/stoppage/createFolders`);

/****************************************************************************************************/
/* Add A Prolongation To A Stoppage */
/****************************************************************************************************/

function addProlongation(stoppageUuid, endDate, attachment, databaseConnection, globalParameters, callback)
{
  const newEndDate = new Date(parseInt(endDate));

  if(newEndDate.toString() === 'Invalid Date')
  {
    return callback({ status: 406, code: constants.ADD_PROLONGATION_INVALID_END_DATE, detail: null });
  }

  if(attachment.type !== 'application/pdf')
  {
    return callback({ status: 406, code: constants.ADD_PROLONGATION_UNAUTHORIZED_ATTACHMENT, detail: null });
  }

  addProlongationCheckIfStoppageExists(stoppageUuid, newEndDate, attachment, databaseConnection, globalParameters, (error, prolongationData) =>
  {
    return callback(error, prolongationData);
  });
}

/****************************************************************************************************/

function addProlongationCheckIfStoppageExists(stoppageUuid, endDate, attachment, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.list,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: stoppageUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return callback({ status: 404, code: constants.ADD_PROLONGATION_STOPPAGE_NOT_FOUND, detail: null });
    }

    return addProlongationCheckStoppageFolder({ uuid: stoppageUuid, end: result[0].end }, endDate, attachment, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addProlongationCheckStoppageFolder(stoppageData, endDate, attachment, databaseConnection, globalParameters, callback)
{
  stoppageCreateFolders.createRecordFolder(stoppageData.uuid, globalParameters, (error) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    return addProlongationCheckStoppageStatus(stoppageData, endDate, attachment, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addProlongationCheckStoppageStatus(stoppageData, endDate, attachment, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.attachment,
    args: [ '*' ],
    where: { operator: '=', key: 'record', value: stoppageData.uuid },
    order: [ { column: 'date', asc: false } ]

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return addProlongationCheckEndDate(stoppageData, endDate, attachment, databaseConnection, globalParameters, callback);
    }

    if(result[0].type === 'rejected' || result[0].type === 'closed' || result[0].type === 'disputed')
    {
      return callback({ status: 406, code: constants.ADD_PROLONGATION_FORBIDDEN_BY_STATUS, detail: null });
    }

    return addProlongationCheckEndDate(stoppageData, endDate, attachment, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addProlongationCheckEndDate(stoppageData, endDate, attachment, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.prolongation,
    args: [ '*' ],
    where: { operator: '=', key: 'record', value: stoppageData.uuid },
    order: [ { column: 'end', asc: false } ]

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      if(stoppageData.end > endDate.getTime())
      {
        return callback({ status: 406, code: constants.ADD_PROLONGATION_END_DATE_HAPPENS_BEFORE_PREVIOUS_END, detail: null });
      }

      return addProlongationInsertIntoDatabase(stoppageData.uuid, stoppageData.end, endDate.getTime(), attachment, databaseConnection, globalParameters, callback);
    }

    if(result[0].end > endDate.getTime())
    {
      return callback({ status: 406, code: constants.ADD_PROLONGATION_END_DATE_HAPPENS_BEFORE_PREVIOUS_END, detail: null });
    }

    return addProlongationInsertIntoDatabase(stoppageData.uuid, result[0].end, endDate.getTime(), attachment, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addProlongationInsertIntoDatabase(stoppageUuid, startDate, endDate, attachment, databaseConnection, globalParameters, callback)
{
  const prolongationUuid = uuid.v4();

  const prolongationData =
  {
    uuid: prolongationUuid,
    record: stoppageUuid,
    attachment: attachment.name,
    start: commonFormatDate.getStringifiedDateFromTimestampSync(startDate),
    end: commonFormatDate.getStringifiedDateFromTimestampSync(endDate)
  }

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.prolongation,
    args:
    {
      uuid: prolongationUuid,
      record: stoppageUuid,
      attachment: attachment.name,
      start: startDate,
      end: endDate
    }

  }, databaseConnection, (error) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    return addProlongationMoveAttachment(stoppageUuid, prolongationData, attachment, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addProlongationMoveAttachment(stoppageUuid, prolongationData, attachment, globalParameters, callback)
{
  commonFilesMove.moveFile(attachment.path, `${globalParameters.storage.root}/${globalParameters.storage.stoppage}/${stoppageUuid}/${prolongationData.uuid}.pdf`, (error) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });
    }

    return callback(null, prolongationData);
  });
}

/****************************************************************************************************/

module.exports =
{
  addProlongation: addProlongation
}
