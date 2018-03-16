'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.createFileInDatabase = (fileName, fileExt, accountID, serviceID, databaseConnector, callback) =>
{
  fileName            == undefined ||
  fileExt             == undefined ||
  accountID           == undefined ||
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.insertQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'uuid': false,
    'args': { 'name': fileName, 'ext': fileExt, 'account': accountID, 'service': serviceID, 'deleted': 0 }

  }, databaseConnector, (boolean, insertedIDOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: insertedIDOrErrorMessage });

    else
    {
      callback(null);
    }
  });
}

/****************************************************************************************************/