'use strict'

const fs                          = require('fs');
const params                      = require(`${__root}/json/params`);
const constants                   = require(`${__root}/functions/constants`);
const accountsGet                 = require(`${__root}/functions/accounts/get`);
const filesCreate                 = require(`${__root}/functions/files/create`);
const storageAppFilesGet          = require(`${__root}/functions/storage/files/get`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager             = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.addUploadFileLog = (logType, accountID, fileID, fileName, fileExt, service, databaseConnector, callback) =>
{
  if(logType == undefined || accountID == undefined || fileID == undefined || fileName == undefined || fileExt == undefined || service == undefined || databaseConnector == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else
  {
    if(Object.values(params.fileLogs).includes(logType) == false) callback({ status: 406, code: constants.LOG_TYPE_DOES_NOT_EXIST });

    else
    {
      storageAppFilesGet.getFileFromDatabaseUsingID(fileID, databaseConnector, (error, file) =>
      {
        if(error != null) callback(error);

        else
        {
          accountsGet.getAccountUsingID(accountID, databaseConnector, (error, account) =>
          {
            if(error != null) callback(error);

            else
            {
              const date = Date.now();

              addUploadFileLogInDatabase(logType, accountID, fileID, date, databaseConnector, (error) =>
              {
                error != null ? callback(error) :

                addUploadFileLogInJSON(logType, accountID, fileID, fileName, fileExt, service, date, (error) =>
                {
                  error != null ? callback(error) : callback(null);
                });
              });
            }
          });
        }
      });
    }
  }
}

/****************************************************************************************************/

function addUploadFileLogInDatabase(logType, accountID, fileID, date, databaseConnector, callback)
{
  databaseManager.insertQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.fileLogs,
    'uuid': false,
    'args': { 'type': logType, 'account': accountID, 'file': fileID, 'date': date }

  }, databaseConnector, (boolean, logIDOrErrorMessage) =>
  {
    boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: logIDOrErrorMessage }) : callback(null);
  });
}

/****************************************************************************************************/

function addUploadFileLogInJSON(logType, accountID, fileID, fileName, fileExt, service, timestamp, callback)
{
  filesCreate.createFile(`${fileName}[${fileExt}].json`, `${params.storage.root}/${params.storage.fileLogs}/${service}`, (error) =>
  {
    if(error != null) callback(error);

    else
    {
      fs.readFile(`${params.storage.root}/${params.storage.fileLogs}/${service}/${fileName}[${fileExt}].json`, (error, data) =>
      {
        if(error) callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

        else
        {
          var date = new Date(timestamp);

          var json = {};
          
          if(data.length > 0) json = JSON.parse(data);

          var index = Object.keys(json).length;

          json[index] = {};
          json[index]['date'] = `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;
          json[index]['account'] = accountID;
          json[index]['file'] = fileID;
          json[index]['action'] = 'upload';

          fs.writeFile(`${params.storage.root}/${params.storage.fileLogs}/${service}/${fileName}[${fileExt}].json`, JSON.stringify(json), (error) =>
          {
            error ? callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message }) : callback(null);
          });
        }
      });
    }
  });
}

/****************************************************************************************************/