'use strict';

var params              = require(`${__root}/json/config`);
var constants           = require(`${__root}/functions/constants`);
var encryption          = require(`${__root}/functions/encryption`);
var databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getFilesFromOneService = (service, databaseConnector, callback) =>
{
  databaseConnector == undefined || service == undefined ? callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.files,
  
    'args': 
    { 
      '0': '*' 
    },
      
    'where':
    {
      '=':
      {
        '0':
        {
          'key': 'service',
          'value': service
        }
      }
    }
  }, databaseConnector, (boolean, rowsOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      if(rowsOrErrorMessage.length == 0) callback({});

      else
      {
        var x = 0;
        
        var fileLoop = () =>
        {
          rowsOrErrorMessage[x]['type'] = params['file_ext'][rowsOrErrorMessage[x]['type']];

          rowsOrErrorMessage[x += 1] != undefined ? fileLoop() :

          getFilesOwners(rowsOrErrorMessage, databaseConnector, (filesOrFalse, errorStatus, errorCode) =>
          {
            filesOrFalse == false ? callback(false, errorStatus, errorCode) : callback(filesOrFalse);
          });
        }

        fileLoop();
      }
    }
  });
}

/****************************************************************************************************/

function getFilesOwners(files, databaseConnector, callback)
{
  var x = 0;

  var loop = (file) =>
  {
    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.accounts,
      
      'args': { '0': 'firstname', '1': 'lastname' },
          
      'where':
      {
        '=':
        {
          '0':
          {
            'key': 'uuid',
            'value': file.account
          }
        }
      }
    }, databaseConnector, (boolean, rowsOrErrorCode) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

      else
      {
        rowsOrErrorCode.length == 0 ? 
        files[Object.keys(files)[x]]['account'] = '??????' : 
        files[Object.keys(files)[x]]['account'] = `${rowsOrErrorCode[0]['firstname']} ${rowsOrErrorCode[0]['lastname'].toUpperCase()}`;
        
        Object.keys(files)[x += 1] != undefined ? loop(files[Object.keys(files)[x]]) : callback(files);
      }
    });
  }

  loop(files[Object.keys(files)[x]]);
}

/****************************************************************************************************/