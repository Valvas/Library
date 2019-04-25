'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

const commonFormatDate    = require(`${__root}/functions/common/format/date`);

/****************************************************************************************************/

function getStoppagesList(databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.list,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    let stoppagesList = [];

    for(let x = 0; x < result.length; x++)
    {
      stoppagesList.push(
      {
        uuid: result[x].uuid,
        registrationNumber: result[x].identifier,
        startDate: commonFormatDate.getStringifiedDateFromTimestampSync(result[x].start),
        sentDate: commonFormatDate.getStringifiedDateFromTimestampSync(result[x].received),
        endDate: commonFormatDate.getStringifiedDateFromTimestampSync(result[x].end),
        employeeLastname: result[x].lastname,
        employeeFirstname: result[x].firstname
      });
    }

    return callback(null, stoppagesList);
  });
}

/****************************************************************************************************/

function getEstablishmentsList(databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.stoppage.label,
    tableName: globalParameters.database.stoppage.tables.establishment,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    let establishmentsList = [];

    for(let x = 0; x < result.length; x++)
    {
      establishmentsList.push(
      {
        uuid: result[x].uuid,
        name: result[x].name
      });
    }

    return callback(null, establishmentsList);
  });
}

/****************************************************************************************************/
/* Retrieve Stoppage Detail With Attachments */
/****************************************************************************************************/

function getStoppageDetail(stoppageUuid, databaseConnection, globalParameters, callback)
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
      return callback({ status: 404, code: constants.STOPPAGE_DETAIL_NOT_FOUND, detail: null });
    }

    const stoppageData =
    {
      uuid: result[0].uuid,
      registrationNumber: result[0].identifier,
      startDate: commonFormatDate.getStringifiedDateFromTimestampSync(result[0].start),
      sentDate: commonFormatDate.getStringifiedDateFromTimestampSync(result[0].received),
      endDate: commonFormatDate.getStringifiedDateFromTimestampSync(result[0].end),
      employeeLastname: result[0].lastname,
      employeeFirstname: result[0].firstname
    }

    return getStoppageDetailRetrieveAttachments(stoppageData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function getStoppageDetailRetrieveAttachments(stoppageData, databaseConnection, globalParameters, callback)
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

    stoppageData.attachments = {};
    stoppageData.attachments.events = [];

    for(let x = 0; x < result.length; x++)
    {
      switch(result[x].type)
      {
        case 'started':

          stoppageData.attachments.initial =
          {
            uuid: result[x].uuid,
            name: result[x].name,
            type: result[x].type,
            date: result[x].date,
            comment: result[x].comment
          }

        break;

        default:

          stoppageData.attachments.events.push(
          {
            uuid: result[x].uuid,
            name: result[x].name,
            type: result[x].type,
            date: result[x].date,
            comment: result[x].comment
          });

        break;
      }
    }

    return callback(null, stoppageData);
  });
}

/****************************************************************************************************/

module.exports =
{
  getStoppagesList: getStoppagesList,
  getStoppageDetail: getStoppageDetail,
  getEstablishmentsList: getEstablishmentsList
}
