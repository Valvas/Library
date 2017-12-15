'use strict';

var params                = require(`${__root}/json/config`);
var constants             = require(`${__root}/functions/constants`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getReportLogs = (reportID, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.report_logs,
        
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
          'key': 'report',
          'value': reportID
        }
      }
    }
  }, databaseConnector, (boolean, logsOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
    
    else
    {
      var x = 0;
      var obj = {};

      var loop = () =>
      {
        obj[x] = {};
        obj[x] = logsOrErrorMessage[x];
        logsOrErrorMessage[x += 1] == undefined ? callback(obj) : loop();
      }

      logsOrErrorMessage.length == 0 ? callback({}) : loop();
    }
  });
}

/****************************************************************************************************/