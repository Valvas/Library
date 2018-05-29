'use strict'

const fs                        = require('fs');
const params                    = require(`${__root}/json/params`);
const constants                 = require(`${__root}/functions/constants`);
const storageAppServicesGet     = require(`${__root}/functions/storage/services/get`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager         = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager           = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.getFileFromDatabase = (fileName, fileExt, serviceID, databaseConnector, callback) =>
{
  fileName            == undefined ||
  fileExt             == undefined ||
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },
    'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'name', 'value': fileName }, '1': { 'key': 'ext', 'value': fileExt }, '2': { 'key': 'service', 'value': serviceID } } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: fileOrErrorMessage });

    else
    {
      if(fileOrErrorMessage.length == 0) callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE });

      else
      {
        //Multiple entries for one file, it must not happen but must be handled in case of
        if(fileOrErrorMessage.length > 1)
        {
          cleanDuplicateFileInDatabase(fileName, fileExt, serviceID, databaseConnector, (error, file) =>
          {
            if(error != null) callback(error);

            else
            {
              fileOrErrorMessage[0].deleted == 1 ? callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE }) : callback(null, file);
            }
          });
        }

        else
        {
          fileOrErrorMessage[0].deleted == 1 ? callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE }) : callback(null, fileOrErrorMessage[0]);
        }
      }
    }
  });
}

/****************************************************************************************************/

module.exports.getFileFromDisk = (fileName, fileExt, serviceName, databaseConnector, callback) =>
{
  fileName            == undefined ||
  fileExt             == undefined ||
  serviceName         == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  fs.stat(`${params.storage.root}/${params.storage.services}/${serviceName}/${fileName}.${fileExt}`, (err, stats) =>
  {
    if(err && err.code != 'ENOENT') callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: err.message });

    else if(err && err.code == 'ENOENT') callback({ status: 404, code: constants.FILE_NOT_FOUND_ON_DISK });

    else
    {
      callback(null, stats);
    }
  });
}

/****************************************************************************************************/

module.exports.getFileFromDatabaseUsingID = (fileID, databaseConnector, callback) =>
{
  fileID                == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': fileID } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: fileOrErrorMessage });

    else
    {
      fileOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE }) :
      callback(null, fileOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

module.exports.getFileFromDatabaseUsingFullName = (fileName, fileExt, serviceID, databaseConnector, callback) =>
{
  fileName              == undefined ||
  fileExt               == undefined ||
  serviceID             == undefined ||
  databaseConnector     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },
    'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'name', 'value': fileName }, '1': { 'key': 'ext', 'value': fileExt }, '2': { 'key': 'service', 'value': serviceID } } } }

  }, databaseConnector, (boolean, fileOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: fileOrErrorMessage });

    else
    {
      fileOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.FILE_NOT_FOUND_IN_DATABASE }) :
      callback(null, fileOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

function cleanDuplicateFileInDatabase(fileName, fileExt, serviceID, databaseConnector, callback)
{
  fileName            == undefined ||
  fileExt             == undefined ||
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  //Get service from the database
  storageAppServicesGet.getServiceUsingID(serviceID, databaseConnector, (error, service) =>
  {
    error != null ? callback(error) :

    //Check if current file exists on the disk, it will determine if the entry in the database must say if the file is in deleted status or not
    fs.stat(`${params.storage.root}/${params.storage.services}/${service.name}/${fileName}.${fileExt}`, (error, stats) =>
    {
      if(error && error.code != 'ENOENT') callback({ status: 500, code: constants.FILE_SYSTEM_ERROR, detail: error.message });

      else
      {
        var fileIsDeleted = false;

        if(error && error.code == 'ENOENT') fileIsDeleted = true;

        //Delete current file entries
        databaseManager.deleteQuery(
        {
          'databaseName': params.database.storage.label,
          'tableName': params.database.storage.tables.files,
          'where': { '0': { 'operator': 'AND', '0': { 'operator': '=', '0': { 'key': 'name', 'value': fileName }, '1': { 'key': 'ext', 'value': fileExt }, '2': { 'key': 'service', 'value': serviceID } } } }

        }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
        {
          if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: deletedRowsOrErrorMessage });

          else
          {
            //Create a new entry with the file parameters
            databaseManager.insertQuery(
            {
              'databaseName': params.database.storage.label,
              'tableName': params.database.storage.tables.files,
              'uuid': false,
              'args': { 'name': fileName, 'ext': fileExt, 'account': 0, 'service': service.id, 'deleted': fileIsDeleted ? 1 : 0 }

            }, databaseConnector, (boolean, insertedIDOrErrorMessage) =>
            {
              if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: deletedRowsOrErrorMessage });

              else
              {
                callback(null, { id: insertedIDOrErrorMessage, name: fileName, ext: fileExt, account: 0, service: service.id, deleted: fileIsDeleted ? 1 : 0 });
              }
            });
          }
        });
      }
    });
  });
}

/****************************************************************************************************/