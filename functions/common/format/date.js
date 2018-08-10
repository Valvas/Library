'use strict'

var constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.getStringifyDateFromTimestamp = (timestamp, callback) =>
{
  if(timestamp == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  var date = new Date(timestamp);

  const str =
  
  `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/` +
  `${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/` +
  `${date.getFullYear()} - ` +
  `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:` +
  `${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:` +
  `${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

  return callback(null, str);
}

/****************************************************************************************************/