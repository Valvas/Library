'use strict';

var params                    = require(`${__root}/json/config`);
var constants                 = require(`${__root}/functions/constants`);
var databaseManager           = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getStringifyDateFromTimestamp = (timestamp, callback) =>
{
  if(timestamp == undefined) callback(false, 406, constants.MISSING_DATA_IN_REQUEST);

  else
  {
    var date = new Date(timestamp);

    var str =
    
    `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/` +
    `${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/` +
    `${date.getFullYear()} - ` +
    `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:` +
    `${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:` +
    `${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

    callback(str);
  }
}

/****************************************************************************************************/