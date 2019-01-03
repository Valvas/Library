'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFormatDate    = require(`${__root}/functions/common/format/date`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);
const commonNewsComment   = require(`${__root}/functions/common/news/comment`);

/****************************************************************************************************/

module.exports.getLastNewsFromIndex = (startIndex, endIndex, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(endIndex == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'index' });
  if(startIndex == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'index' });
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

    for(var x = startIndex; x < endIndex; x++)
    {
      if(result[x] != undefined) resultsToKeep.push({ uuid: result[x].uuid, title: result[x].title, content: result[x].content, timestamp: result[x].timestamp, author: result[x].author, comments: [] })
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
          resultsToKeep[x].authorUuid = accountExists ? accountData.uuid : null;

          commonNewsComment.getArticleComments(resultsToKeep[x].uuid, databaseConnection, params, (error, articleComments) =>
          {
            if(error != null) return callback(error);

            resultsToKeep[x].comments = articleComments;

            if(resultsToKeep[x += 1] == undefined) return callback(null, resultsToKeep);

            resultBrowser();
          });
        });
      });
    }

    if(resultsToKeep.length === 0) return callback(null, []);

    resultBrowser();
  });
}

/****************************************************************************************************/

module.exports.getNewsIndexFromUuid = (newsUuid, databaseConnection, params, callback) =>
{
  if(params == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'params' });
  if(newsUuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'newsUuid' });
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

    var index = null;

    for(var x = 0; x < result.length; x++)
    {
      if(result[x].uuid === newsUuid) return callback(null, x);
    }

    return callback({ status: 404, code: constants.ARTICLE_NOT_FOUND, detail: null });
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
        newsData.comments   = [];
        newsData.author     = accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}` : '??????????';
        newsData.authorUuid = accountExists ? accountData.uuid : null;

        commonNewsComment.getArticleComments(result[0].uuid, databaseConnection, params, (error, articleComments) =>
        {
          if(error != null) return callback(error);

          newsData.comments = articleComments;

          return callback(null, true, newsData);
        });
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
          newsData[index].authorUuid = accountExists ? accountData.uuid : null;

          if(result[index += 1] == undefined) return callback(null, newsData);

          resultBrowser();
        });
      });
    }

    resultBrowser();
  });
}

/****************************************************************************************************/
