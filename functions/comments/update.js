'use strict';

var params                = require(`${__root}/json/config`);
var constants             = require(`${__root}/functions/constants`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.updateCommentStatus = (commentID, commentStatus, databaseConnector, callback) =>
{
  if(commentID == undefined || commentStatus == undefined) callback(false, 406, constants.MISSING_DATA_IN_REQUEST);

  else
  {
    if(commentStatus != 'true' && commentStatus != 'false') callback(false, 406, constants.COMMENT_STATUS_INCORRECT);

    else
    {
      databaseManager.selectQuery(
      {
        'databaseName': params.database.name,
        'tableName': params.database.tables.report_comments,
        'args': { '0': 'id' },
        'where': { '=': { '0': { 'key': 'id', 'value': commentID } } }

      }, databaseConnector, (boolean, commentOrErrorMessage) =>
      {
        if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

        else
        {
          commentOrErrorMessage.length == 0 ? callback(false, 404, constants.COMMENT_NOT_FOUND) :

          databaseManager.updateQuery(
          {
            'databaseName': params.database.name,
            'tableName': params.database.tables.report_comments,
            'args': { 'seen': commentStatus == 'true' ? 1 : 0 },
            'where': { '=': { '0': { 'key': 'id', 'value': commentID } } }

          }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
          {
            if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

            else
            {
              updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.COMMENT_STATUS_NOT_UPDATED) : callback(true);
            }
          });
        }
      });
    }
  }
}

/****************************************************************************************************/