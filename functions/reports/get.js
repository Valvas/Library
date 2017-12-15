'use strict';

var params                    = require(`${__root}/json/config`);
var logsGet                   = require(`${__root}/functions/logs/get`);
var constants                 = require(`${__root}/functions/constants`);
var dateFormat                = require(`${__root}/functions/format/date`);
var commentsGet               = require(`${__root}/functions/comments/get`);
var accountsGet               = require(`${__root}/functions/accounts/get`);
var databaseManager           = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getReportUsingUUID = (reportUUID, databaseConnector, callback) =>
{
  reportUUID == undefined || databaseConnector == undefined ? callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.reports,

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
          'key': 'uuid',
          'value': reportUUID
        }
      }
    }
  }, databaseConnector, (boolean, reportOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      reportOrErrorMessage.length == 0 ? callback(false, 404, constants.REPORT_NOT_FOUND) : callback(reportOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/

module.exports.getReportForAdminUsingUUID = (reportUUID, databaseConnector, callback) =>
{
  reportUUID == undefined || databaseConnector == undefined ? callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :
  
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.reports,
  
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
          'key': 'uuid',
          'value': reportUUID
        }
      }
    }
  }, databaseConnector, (boolean, reportOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
  
    else
    {
      reportOrErrorMessage.length == 0 ? callback(false, 404, constants.REPORT_NOT_FOUND) : 

      logsGet.getReportLogs(reportOrErrorMessage[0].id, databaseConnector, (logsOrFalse, errorStatus, errorCode) =>
      {
        if(logsOrFalse == false) callback(false, errorStatus, errorCode);

        else
        {
          var x = 0, y = 0;
          reportOrErrorMessage[0].comments = {};

          var loop = () =>
          {
            if(logsOrFalse[y].type == 1)
            {
              commentsGet.getReportCommentUsingLogID(logsOrFalse[y].id, databaseConnector, (commentOrFalse, errorStatus, errorCode) =>
              {
                if(commentOrFalse == false) callback(false, errorStatus, errorCode);

                else
                {
                  reportOrErrorMessage[0].comments[x] = {};

                  accountsGet.getAccountUsingID(commentOrFalse.account, databaseConnector, (accountOrFalse, errorStatus, errorCode) =>
                  {
                    if(accountOrFalse == false) callback(false, errorStatus, errorCode);

                    else
                    {
                      commentOrFalse.account = `${accountOrFalse.firstname.charAt(0).toUpperCase()}${accountOrFalse.firstname.slice(1)} ${accountOrFalse.lastname.toUpperCase()}`;
                      
                      dateFormat.getStringifyDateFromTimestamp(commentOrFalse.date, (dateOrFalse, errorStatus, errorCode) =>
                      {
                        if(dateOrFalse == false) callback(false, errorStatus, errorCode);

                        else
                        {
                          commentOrFalse.date = dateOrFalse;

                          reportOrErrorMessage[0].comments[x] = commentOrFalse;
                          
                          x += 1;
                          
                          logsOrFalse[y += 1] == undefined ? callback(reportOrErrorMessage[0]) : loop();
                        }
                      });
                    }
                  });
                }
              });
            }
            
            else
            {
              logsOrFalse[y += 1] == undefined ? callback(reportOrErrorMessage[0]) : loop();
            }
          }

          logsOrFalse[y] == undefined ? callback(reportOrErrorMessage[0]) : loop();
        }
      });
    }
  });
}

/****************************************************************************************************/