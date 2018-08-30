'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFormatDate    = require(`${__root}/functions/common/format/date`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.getLastNewsFromIndex = (index, databaseConnection, params, callback) =>
{
  if(index == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'index' });
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  if(index < 0) index = 0;

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.news,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, []);

    var startIndex, endIndex;

    if((index + 40) > result.length) endIndex = result.length;

    startIndex = (endIndex - 40) > 0 ? (endIndex - 40) : index;

    var newsArray = [];

    var resultIndex = startIndex, x = 0;

    var resultBrowser = () =>
    {
      newsArray[x] = {};

      commonAccountsGet.checkIfAccountExistsFromUuid(result[resultIndex].author, databaseConnection, params, (error, accountExists, accountData) =>
      {
        if(error != null) return callback(error);

        commonFormatDate.getStringifyDateFromTimestamp(result[resultIndex].timestamp * 1000, (error, stringifyTimestamp) =>
        {
          if(error != null) return callback(error);

          newsArray[x].uuid       = result[resultIndex].uuid;
          newsArray[x].title      = result[resultIndex].title;
          newsArray[x].content    = result[resultIndex].content;
          newsArray[x].timestamp  = stringifyTimestamp;
          newsArray[x].author     = accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}` : '??????????';

          x += 1;

          if((resultIndex += 1) === endIndex) return callback(null, newsArray);

          resultBrowser();
        });
      });
    }

    resultBrowser();
  });
}

/****************************************************************************************************/

module.exports.getNewsData = (newsUuid, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(newsUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'newsUuid' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.news,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: newsUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, false);

    var newsData = {};

    commonAccountsGet.checkIfAccountExistsFromUuid(result[0].author, databaseConnection, params, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      commonFormatDate.getStringifyDateFromTimestamp(result[0].timestamp * 1000, (error, stringifyTimestamp) =>
      {
        if(error != null) return callback(error);

        newsData.uuid       = result[0].uuid;
        newsData.title      = result[0].title;
        newsData.content    = result[0].content;
        newsData.timestamp  = stringifyTimestamp;
        newsData.author     = accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}` : '??????????';

        return callback(null, true, newsData);
      });
    });
  });
}

/****************************************************************************************************/

module.exports.getAllNewsData = (databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'databaseConnection' });

  databaseManager.selectQuery(
  {
    databaseName: params.database.root.label,
    tableName: params.database.root.tables.news,
    args: [ '*' ],
    where: {  }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    if(result.length === 0) return callback(null, []);

    var index = 0, newsData = [];

    var resultBrowser = () =>
    {
      commonAccountsGet.checkIfAccountExistsFromUuid(result[index].author, databaseConnection, params, (error, accountExists, accountData) =>
      {
        if(error != null) return callback(error);

        commonFormatDate.getStringifyDateFromTimestamp(result[index].timestamp * 1000, (error, stringifyTimestamp) =>
        {
          if(error != null) return callback(error);

          newsData[index] = {};

          newsData[index].uuid       = result[index].uuid;
          newsData[index].title      = result[index].title;
          newsData[index].content    = result[index].content;
          newsData[index].timestamp  = stringifyTimestamp;
          newsData[index].author     = accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}` : '??????????';

          if(result[index += 1] == undefined) return callback(null, newsData);

          resultBrowser();
        });
      });
    }

    resultBrowser();
  });
}

/****************************************************************************************************/
