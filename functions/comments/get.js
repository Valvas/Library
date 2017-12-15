'use strict';

var params                = require(`${__root}/json/config`);
var constants             = require(`${__root}/functions/constants`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getReportCommentUsingLogID = (logID, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.report_comments,
      
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
          'key': 'log',
          'value': logID
        }
      }
    }
  }, databaseConnector, (boolean, commentOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      commentOrErrorMessage.length == 0 ? callback(false, 404, constants.COMMENT_NOT_FOUND) : callback(commentOrErrorMessage[0]);
    }
  });
}

/****************************************************************************************************/