'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const accountsGet         = require(`${__root}/functions/accounts/get`);
const storageAppfilesGet  = require(`${__root}/functions/storage/files/get`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.setFileOwner = (accountID, fileID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  fileID              == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    if(error != null) callback(error);

    else
    {
      storageAppfilesGet.getFileFromDatabaseUsingID(fileID, databaseConnector, (error, file) =>
      {
        if(error != null) callback(error);

        else
        {
          databaseManager.updateQuery(
          {
            'databaseName': params.database.storage.label,
            'tableName': params.database.storage.tables.files,
            'args': { 'account': accountID },
            'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': fileID } } }

          }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
          {
            if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: updatedRowsOrErrorMessage });

            else
            {
              callback(null);
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/

module.exports.setFileNotDeleted = (accountID, fileID, databaseConnector, callback) =>
{
  accountID           == undefined ||
  fileID              == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
  {
    if(error != null) callback(error);

    else
    {
      storageAppfilesGet.getFileFromDatabaseUsingID(fileID, databaseConnector, (error, file) =>
      {
        if(error != null) callback(error);

        else
        {
          databaseManager.updateQuery(
          {
            'databaseName': params.database.storage.label,
            'tableName': params.database.storage.tables.files,
            'args': { 'deleted': 0 },
            'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': fileID } } }

          }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
          {
            if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: updatedRowsOrErrorMessage });

            else
            {
              callback(null);
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/