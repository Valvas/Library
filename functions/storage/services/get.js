'use strict'

const params              = require(`${__root}/json/params`);
const constants           = require(`${__root}/functions/constants`);
const accountsGet         = require(`${__root}/functions/accounts/get`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager     = require(`${__root}/functions/database/MySQLv2`);

var storageAppServicesGet = module.exports = {};

/****************************************************************************************************/

storageAppServicesGet.getServiceUsingID = (serviceID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0' : { 'key': 'id', 'value': serviceID } } }

  }, databaseConnector, (boolean, serviceOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: serviceOrErrorMessage });

    else
    {
      serviceOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.SERVICE_NOT_FOUND }) :
      callback(null, serviceOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

storageAppServicesGet.getServiceUsingName = (serviceName, databaseConnector, callback) =>
{
  serviceName         == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0' : { 'key': 'name', 'value': serviceName } } }

  }, databaseConnector, (boolean, serviceOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: serviceOrErrorMessage });

    else
    {
      serviceOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.SERVICE_NOT_FOUND }) :
      callback(null, serviceOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

storageAppServicesGet.getServiceUsingLabel = (serviceLabel, databaseConnector, callback) =>
{
  serviceLabel        == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { '0': '*' },
    'where': { '0': { 'operator': '=', '0' : { 'key': 'label', 'value': serviceLabel } } }

  }, databaseConnector, (boolean, serviceOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: serviceOrErrorMessage });

    else
    {
      serviceOrErrorMessage.length == 0 ?
      callback({ status: 404, code: constants.SERVICE_NOT_FOUND }) :
      callback(null, serviceOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

storageAppServicesGet.getAllServices = (databaseConnector, callback) =>
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
        services[servicesOrErrorMessage[x].id] = {};
        services[servicesOrErrorMessage[x].id].name = servicesOrErrorMessage[x].name;
        services[servicesOrErrorMessage[x].id].label = servicesOrErrorMessage[x].label;
        services[servicesOrErrorMessage[x].id].fileLimit = servicesOrErrorMessage[x].file_limit;

        servicesOrErrorMessage[x += 1] == undefined ? callback(null, services) : loop();
      }

      servicesOrErrorMessage.length == 0 ? callback(null, services) : loop();
    }
  });
}

/****************************************************************************************************/

storageAppServicesGet.getFilesFromService = (serviceName, databaseConnector, callback) =>
{
  serviceName         == undefined ||
  databaseConnector   == undefined ? 
  
  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  storageAppServicesGet.getServiceUsingName(serviceName, databaseConnector, (error, service) =>
  {
    if(error != null) callback(error);
    
    else
    {
      databaseManager.selectQuery(
      {
        'databaseName': params.database.storage.label,
        'tableName': params.database.storage.tables.files,
        'args': { '0': '*' },  
        'where': { '0': { 'operator': '=', '0': { 'key': 'service', 'value': service.id } } }
    
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
    
            files[x].ext      = filesOrErrorMessage[x].ext;
            files[x].name     = filesOrErrorMessage[x].name;
            files[x].deleted  = filesOrErrorMessage[x].deleted;
            files[x].account  = filesOrErrorMessage[x].account;
    
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
  });
}

/****************************************************************************************************/

function getFilesOwners(files, databaseConnector, callback)
{
  var x = 0;

  var loop = () =>
  {
    accountsGet.getAccountUsingID(files[x].account, databaseConnector, (error, account) =>
    {
      if(error != null && error.status != 404) callback(error);

      else
      {
        account == undefined ?
        files[x].account = '??????' : 
        files[x].account = `${account.firstname.charAt(0).toUpperCase()}${account.firstname.slice(1).toLowerCase()} ${account.lastname.toUpperCase()}`;

        files[x += 1] == undefined ? callback(null, files) : loop();
      }
    });
  }

  loop();
}

/****************************************************************************************************/

module.exports.getAmountOfFilesFromService = (serviceID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.files,
    'args': { '0': '*' },  
    'where': { '0': { 'operator': '=', '0': { 'key': 'service', 'value': serviceID } } }

  }, databaseConnector, (boolean, filesOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: filesOrErrorMessage });
    
    else
    {
      var x = 0;
      var amountOfFiles = 0;

      var browseFileLoop = () =>
      {
        if(filesOrErrorMessage[x].deleted == 0) amountOfFiles += 1;
        
        filesOrErrorMessage[x += 1] == undefined ? callback(null, amountOfFiles) : browseFileLoop();
      }

      filesOrErrorMessage.length == 0 ? callback(null, 0) : browseFileLoop();
    }
  });
}

/****************************************************************************************************/

module.exports.getAmountOfMembersFromService = (serviceID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.rights,
    'args': { '0': 'id' },  
    'where': { '0': { 'operator': '=', '0': { 'key': 'service', 'value': serviceID } } }

  }, databaseConnector, (boolean, membersIDsOrErrorMessage) =>
  {
    boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: membersIDsOrErrorMessage }) : callback(null, Object.keys(membersIDsOrErrorMessage).length);
  });
}

/****************************************************************************************************/

module.exports.getFileMaxSize = (serviceID, databaseConnector, callback) =>
{
  serviceID           == undefined ||
  databaseConnector   == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.storage.label,
    'tableName': params.database.storage.tables.services,
    'args': { '0': 'file_limit' },  
    'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': serviceID } } }

  }, databaseConnector, (boolean, fileMaxSizeOrErrorMessage) =>
  {
    boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: fileMaxSizeOrErrorMessage }) : callback(null, parseInt(fileMaxSizeOrErrorMessage[0].file_limit));
  });
}

/****************************************************************************************************/