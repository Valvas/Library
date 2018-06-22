'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.getExtensions = (databaseConnection, databaseParams, callback) =>
{
  databaseManager.selectQuery(
  {
    databaseName: databaseParams.label,
    tableName: databaseParams.tables.extensions,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null, result);
  });
}

/****************************************************************************************************/