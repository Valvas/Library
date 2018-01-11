'use strict';

var logs                      = require(`${__root}/json/logs`);
var params                    = require(`${__root}/json/config`);
var errors                    = require(`${__root}/json/errors`);
var logGet                    = require(`${__root}/functions/logs/get`);
var constants                 = require(`${__root}/functions/constants`);
var dateFormat                = require(`${__root}/functions/format/date`);
var reportsGet                = require(`${__root}/functions/reports/get`);
var commentGet                = require(`${__root}/functions/comments/get`);
var accountGet                = require(`${__root}/functions/accounts/get`);
var databaseManager           = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getReports = (databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.reports,
    'args': { '0': '*' },
    'where': { }
  }, databaseConnector, (boolean, reportsOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      var x = 0;
      var obj = {};

      var reportLoop = () =>
      {
        obj[x] = {};
 
        obj[x]['report_uuid'] = reportsOrErrorMessage[x]['uuid'];
        obj[x]['report_type'] = reportsOrErrorMessage[x]['report_type'];
        obj[x]['report_status'] = reportsOrErrorMessage[x]['report_status'];
        obj[x]['report_subject'] = reportsOrErrorMessage[x]['report_subject'];
        obj[x]['report_content'] = reportsOrErrorMessage[x]['report_content'];

        dateFormat.getStringifyDateFromTimestamp(reportsOrErrorMessage[x]['report_date'], (dateOrFalse, errorStatus, errorCode) =>
        {
          if(dateOrFalse == false) callback(false, errorStatus, errorCode);

          else
          {
            obj[x]['report_date'] = dateOrFalse;

            reportsOrErrorMessage[x += 1] == undefined ? callback(obj) : reportLoop();
          }
        });
      }

      reportsOrErrorMessage.length == 0 ? callback({}) : reportLoop();
    }
  });
}

/****************************************************************************************************/

module.exports.getReport = (reportUUID, databaseConnector, callback) =>
{
  reportsGet.getReportUsingUUID(reportUUID, databaseConnector, (reportOrFalse, errorStatus, errorCode) =>
  {
    if(reportOrFalse == false) callback(false, errorStatus, errorCode);

    else
    {
      dateFormat.getStringifyDateFromTimestamp(reportOrFalse['report_date'], (dateOrFalse, errorStatus, errorCode) =>
      {
        if(dateOrFalse == false) callback(false, errorStatus, errorCode);

        else
        {
          reportOrFalse['report_date'] = dateOrFalse;

          var obj = reportOrFalse;

          logGet.getReportLogs(obj.id, databaseConnector, (logsOrFalse, errorStatus, errorCode) =>
          {
            var x = 0;
            obj.logs = {};

            var logsLoop = () =>
            {
              accountGet.getAccountUsingID(logsOrFalse[x].account, databaseConnector, (accountOrErrorMessage, errorStatus, errorCode) =>
              {
                var array = [];
                
                obj.logs[x] = {};

                dateFormat.getStringifyDateFromTimestamp(logsOrFalse[x]['date'], (dateOrFalse, errorStatus, errorCode) =>
                {
                  if(dateOrFalse == false) callback(false, errorStatus, errorCode);

                  else
                  {
                    obj.logs[x]['type'] = logsOrFalse[x]['type'];
                    obj.logs[x]['date'] = dateOrFalse;

                    var label = logs.report_logs[obj.logs[x]['type']];
                    
                    var y = -1;
    
                    accountOrErrorMessage == false ? array = ['??????', '??????'] : array = [accountOrErrorMessage.firstname, accountOrErrorMessage.lastname.toUpperCase()];

                    label = label.replace(/VALUE/g, () => { return array[y += 1]; });

                    obj.logs[x]['label'] = label;

                    if(obj.logs[x]['type'] == 1)
                    {
                      commentGet.getReportCommentUsingLogID(logsOrFalse[x]['id'], databaseConnector, (commentOrFalse, errorStatus, errorCode) =>
                      {
                        obj.logs[x]['comment'] = {};

                        if(commentOrFalse == false)
                        {
                          obj.logs[x]['comment']['message'] = errors[errorCode];
                        }

                        else
                        {
                          obj.logs[x]['comment']['message'] = commentOrFalse.content;
                        }

                        obj.logs[x]['comment']['read'] = commentOrFalse.seen;

                        logsOrFalse[x += 1] == undefined ? callback(obj) : logsLoop();
                      });
                    }

                    else
                    {
                      logsOrFalse[x += 1] == undefined ? callback(obj) : logsLoop();
                    }
                  }
                });
              });
            }

            logsOrFalse.length == 0 ? callback({}) : logsLoop();
          });
        }
      });
    }
  });
}

/****************************************************************************************************/

module.exports.addComment = (reportUUID, comment, accountUUID, databaseConnector, callback) =>
{
  reportUUID == undefined || comment == undefined || accountUUID == undefined || databaseConnector == undefined ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  accountGet.getAccountUsingUUID(accountUUID, databaseConnector, (accountOrFalse, errorStatus, errorCode) =>
  {
    accountOrFalse == false ? callback(false, errorStatus, errorCode) :

    reportsGet.getReportUsingUUID(reportUUID, databaseConnector, (reportOrFalse, errorStatus, errorCode) =>
    {
      reportOrFalse == false ? callback(false, errorStatus, errorCode) :

      databaseManager.insertQuery(
      {
        'databaseName': params.database.name,
        'tableName': params.database.tables.report_logs,
            
        'uuid': false,
            
        'args':
        {
          'date': Date.now(),
          'account': accountOrFalse.id,
          'type': 1,
          'report': reportOrFalse.id
        }
      }, databaseConnector, (boolean, insertedIdOrErrorMessage) =>
      {
        boolean == false ? callback(false, 500, constants.SQL_SERVER_ERROR) :
    
        databaseManager.insertQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.report_comments,
              
          'uuid': false,
              
          'args':
          {
            'date': Date.now(),
            'account': accountOrFalse.id,
            'log': insertedIdOrErrorMessage,
            'content': comment,
            'seen': 0
          }
        }, databaseConnector, (boolean, insertedIdOrErrorMessage) =>
        {
          boolean ? callback(true) : callback(false, 500, constants.SQL_SERVER_ERROR);
        });
      });
    });
  });
}

/****************************************************************************************************/