'use strict';

let SQLManager           = require('./database');
let constants            = require('./constants');
let config               = require('../json/config');

/****************************************************************************************************/

module.exports.getReports = (SQLConnector, callback) =>
{
  SQLManager.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.reports_table,

    "args":
    {
      "0": "*"
    },

    "where":
    {

    }
  }, SQLConnector, (trueOrFalse, rowsOrErrorMessage) =>
  {
    if(trueOrFalse == false) callback(false, constants.SQL_SERVER_ERROR);

    let obj = {};
    let x = 0;

    let loop = function()
    {
      obj[x] = {};

      let date = new Date(rowsOrErrorMessage[x].report_date * 1000);

      rowsOrErrorMessage[x]['report_content'].length > 64 ?
      obj[x]['report_content'] = `${rowsOrErrorMessage[x]['report_content'].slice(0, 60)}...` :
      obj[x]['report_content'] = rowsOrErrorMessage[x]['report_content'];

      obj[x]['report_uuid'] = rowsOrErrorMessage[x]['uuid'];
      obj[x]['report_type'] = rowsOrErrorMessage[x]['report_type'];
      obj[x]['report_subject'] = rowsOrErrorMessage[x]['report_subject'];
      obj[x]['report_status'] = rowsOrErrorMessage[x]['report_status'];
      obj[x]['report_date'] = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

      rowsOrErrorMessage[x += 1] != undefined ? loop() : callback(true, obj);
    }

    rowsOrErrorMessage.length == 0 ? callback(true, {}) : loop();
  });
}

/****************************************************************************************************/

module.exports.getReport = (reportUUID, databaseConnector, callback) =>
{
  SQLManager.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.reports_table,

    "args":
    {
      "0": "*"
    },

    "where":
    {
      "=":
      {
        "0":
        {
          "key": "uuid",
          "value": reportUUID
        }
      }
    }
  }, databaseConnector, (boolean, rowsOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      if(rowsOrErrorMessage.length == 0) callback(false, 404, constants.REPORT_NOT_FOUND);
      
      else
      {
        var obj = {};

        var date = new Date(rowsOrErrorMessage[0]['report_date'] * 1000);

        rowsOrErrorMessage[0]['report_date'] = `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/${date.getMonth() + 1 < 10 ? '0' + date.getMonth() + 1 : date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

        obj = rowsOrErrorMessage[0];

        SQLManager.SQLSelectQuery(
        {
          "databaseName": config.database.library_database,
          "tableName": config.database.report_comments_table,
        
          "args":
          {
            "0": "*"
          },
        
          "where":
          {
            "=":
            {
              "0":
              {
                "key": "report",
                "value": reportUUID
              }
            }
          }
        }, databaseConnector, (boolean, commentsOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

          else
          {
            obj.comments = {};

            if(commentsOrErrorMessage.length == 0) callback(obj);

            else
            {
              var x = 0;

              var commentsLoop = () =>
              {
                var date = new Date(commentsOrErrorMessage[x]['date']);

                commentsOrErrorMessage[x]['date'] = `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/${date.getMonth() + 1 < 10 ? '0' + date.getMonth() + 1 : date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

                obj.comments[x] = commentsOrErrorMessage[x];

                commentsOrErrorMessage[x += 1] == undefined ? callback(obj) : commentsLoop();
              }

              commentsLoop();
            }
          }
        });
      }
    }
  });
}

/****************************************************************************************************/

module.exports.saveReport = (reportType, reportSubject, reportContent, accountUUID, SQLConnector, callback) =>
{
  SQLManager.SQLInsertQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.reports_table,

    "uuid": true,

    "args":
    {
      "report_type": reportType,
      "report_subject": reportSubject,
      "report_content": reportContent,
      "report_account": accountUUID,
      "report_date": new Date(Date.now()) / 1000,
      "report_status": 0
    }
  }, SQLConnector, (trueOrFalse, uuidOrErrorMessage) =>
  {
    trueOrFalse ? callback(true, uuidOrErrorMessage) : callback(false, constants.SQL_SERVER_ERROR);
  });
}

/****************************************************************************************************/