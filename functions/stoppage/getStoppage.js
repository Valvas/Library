'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

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
        startDate: result[x].start,
        sentDate: result[x].received,
        endDate: result[x].end
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

module.exports =
{
  getStoppagesList: getStoppagesList,
  getEstablishmentsList: getEstablishmentsList
}
