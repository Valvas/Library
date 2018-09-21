'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFormatDate    = require(`${__root}/functions/common/format/date`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.getLastNewsFromIndex = (currentPage, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(currentPage == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'index' });
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

    result.reverse();

    var resultsToKeep = [];

    const amountOfPages = Math.ceil(result.length / 5);

    const startIndex = (currentPage - 3) < 0 ? 0 : (currentPage - 3);
    const endIndex = (startIndex + 8) > amountOfPages ? amountOfPages : (startIndex + 8);

    for(var x = (startIndex * 5); x < (endIndex * 5); x++)
    {
      if(result[x] != undefined) resultsToKeep.push({ uuid: result[x].uuid, title: result[x].title, content: result[x].content, timestamp: result[x].timestamp, author: result[x].author })
    }

    var x = 0;

    var resultBrowser = () =>
    {
      commonAccountsGet.checkIfAccountExistsFromUuid(resultsToKeep[x].author, databaseConnection, params, (error, accountExists, accountData) =>
      {
        if(error != null) return callback(error);

        commonFormatDate.getStringifyDateFromTimestamp(resultsToKeep[x].timestamp, (error, stringifyTimestamp) =>
        {
          if(error != null) return callback(error);

          resultsToKeep[x].timestamp  = stringifyTimestamp;
          resultsToKeep[x].author     = accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}` : '??????????';

          resultsToKeep[x += 1] != undefined ? resultBrowser() : formatNews();
        });
      });
    }

    var formatNews = () =>
    {
      var newsToReturn = [];

      for(var x = 0; x < resultsToKeep.length; x++)
      {
        if(newsToReturn[Math.floor(x / 5)] == undefined) newsToReturn.push([]);
        newsToReturn[Math.floor(x / 5)].push(resultsToKeep[x]);
      }

      return callback(null, newsToReturn, { startIndex: startIndex, endIndex: endIndex, currentIndex: parseInt(currentPage) });
    }

    resultBrowser();

    /*var x = 0;

    var resultBrowser = () =>
    {
      commonAccountsGet.checkIfAccountExistsFromUuid(newsToReturn[x].author, databaseConnection, params, (error, accountExists, accountData) =>
      {
        if(error != null) return callback(error);

        commonFormatDate.getStringifyDateFromTimestamp(newsToReturn[x].timestamp, (error, stringifyTimestamp) =>
        {
          if(error != null) return callback(error);

          newsArray[x].uuid       = result[startIndex + x].uuid;
          newsArray[x].title      = result[startIndex + x].title;
          newsArray[x].content    = result[startIndex + x].content;
          newsArray[x].timestamp  = stringifyTimestamp;
          newsArray[x].author     = accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}` : '??????????';

          if(startIndex + (x += 1) === endIndex) return callback(null, newsArray);

          resultBrowser();
        });
      });
    }

    resultBrowser();*/
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

      commonFormatDate.getStringifyDateFromTimestamp(result[0].timestamp, (error, stringifyTimestamp) =>
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

        commonFormatDate.getStringifyDateFromTimestamp(result[index].timestamp, (error, stringifyTimestamp) =>
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
