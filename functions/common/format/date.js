'use strict'

const constants = require(`../../constants`);

/****************************************************************************************************/

function getStringifiedDateTimeFromTimestampAsync(timestamp, callback)
{
  const date = new Date(timestamp);

  const buildDate =

  `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/` +
  `${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/` +
  `${date.getFullYear()} - ` +
  `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:` +
  `${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:` +
  `${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

  return callback(null, buildDate);
}

/****************************************************************************************************/

function getStringifiedDateFromTimestampAsync(timestamp, callback)
{
  const date = new Date(timestamp);

  const buildDate =

  `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/` +
  `${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/` +
  `${date.getFullYear()}`;

  return callback(null, buildDate);
}

/****************************************************************************************************/

function getStringifiedDateTimeFromTimestampSync(timestamp)
{
  const date = new Date(timestamp);

  const buildDate =

  `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/` +
  `${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/` +
  `${date.getFullYear()} - ` +
  `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:` +
  `${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}:` +
  `${date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()}`;

  return buildDate;
}

/****************************************************************************************************/

function getStringifiedDateFromTimestampSync(timestamp)
{
  const date = new Date(timestamp);

  const buildDate =

  `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}/` +
  `${(date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/` +
  `${date.getFullYear()}`;

  return buildDate;
}

/****************************************************************************************************/

module.exports =
{
  getStringifiedDateFromTimestampSync: getStringifiedDateFromTimestampSync,
  getStringifiedDateFromTimestampAsync: getStringifiedDateFromTimestampAsync,
  getStringifiedDateTimeFromTimestampSync: getStringifiedDateTimeFromTimestampSync,
  getStringifiedDateTimeFromTimestampAsync: getStringifiedDateTimeFromTimestampAsync
}

/****************************************************************************************************/
