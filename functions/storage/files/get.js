'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getFileFromDatabase = (fileName, fileExt, service, databaseConnector, callback) =>
{
  fileName            == undefined ||
  fileExt             == undefined ||
  service             == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {

  });
}

/****************************************************************************************************/