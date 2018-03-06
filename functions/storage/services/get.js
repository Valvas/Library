'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getService = (service, databaseConnector, callback) =>
{
  service             == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { '0': '*' },
    'where': { '=': { '0': { 'key': 'name', 'value': service } } }

  }, databaseConnector, (boolean, serviceOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: serviceOrErrorMessage });

    else
    {
      serviceOrErrorMessage.length == 0 ?
      callback({ status: 500, code: constants.SERVICE_NOT_FOUND }) :
      callback(null, serviceOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

module.exports.getAllServices = (databaseConnector, callback) =>
{
  databaseConnector == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { '0': '*' },
    'where': {  }

  }, databaseConnector, (boolean, servicesOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: servicesOrErrorMessage });

    else
    {
      var x = 0;
      var services = {};

      var loop = () =>
      {
        services[x] = servicesOrErrorMessage[x];

        servicesOrErrorMessage[x += 1] == undefined ? callback(null, services) : loop();
      }

      servicesOrErrorMessage.length == 0 ? callback(null, services) : loop();
    }
  });
}

/****************************************************************************************************/

module.exports.getFilesFromService = (service, databaseConnector, callback) =>
{
  service             == undefined ||
  databaseConnector   == undefined ? 
  
  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },  
    'where': { '=': { '0': { 'key': 'service', 'value': service } } }

  }, databaseConnector, (boolean, filesOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: filesOrErrorMessage });

    else
    {
      var x = 0;
      var files = {};
      
      var loop = () =>
      {
        files[x] = {};

        files[x].ext      = filesOrErrorMessage[x].type;
        files[x].name     = filesOrErrorMessage[x].name;
        files[x].deleted  = filesOrErrorMessage[x].deleted;
        files[x].type     = params.ext[filesOrErrorMessage[x].type];

        filesOrErrorMessage[x += 1] != undefined ? loop() :

        getFilesOwners(files, databaseConnector, (error, result) =>
        {
          error == null ? callback(null, result) : callback(error);
        });
      }

      filesOrErrorMessage[x] == undefined ? callback(null, files) : loop();
    }
  });
}

/****************************************************************************************************/

function getFilesOwners(files, databaseConnector, callback)
{
  var x = 0;

  var loop = () =>
  {
    databaseManager.selectQuery(
    {
      'databaseName': params.database.storage.label,
      'tableName': params.database.storage.tables.accounts,  
      'args': { '0': 'firstname', '1': 'lastname' },  
      'where': { '=': { '0': { 'key': 'uuid', 'value': files[x].account } } }

    }, databaseConnector, (boolean, accountOrErrorMessage) =>
    {
      if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: accountOrErrorMessage });

      else
      {
        accountOrErrorMessage.length == 0 ? 
        files[x].account = '??????' : 
        files[x].account = `${accountOrErrorMessage[0].firstname} ${accountOrErrorMessage[0].lastname.toUpperCase()}`;
        
        files[x += 1] == undefined ? callback(null, files) : loop();
      }
    });
  }

  loop();
}

/****************************************************************************************************/