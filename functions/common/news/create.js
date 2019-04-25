'use strict'

const uuid              = require('uuid');
const constants         = require(`${__root}/functions/constants`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);
const commonAccountsGet = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.createNewArticle = (articleTitle, articleContent, accountUuid, databaseConnection, params, callback) =>
{
  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    if(accountExists === false)
    {
      return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });
    }

    if(articleTitle.length < 1 || articleTitle.length > 255)
    {
      return callback({ status: 406, code: constants.INCORRECT_ARTICLE_TITLE_FORMAT, detail: null });
    }

    if(articleContent.length < 64)
    {
      return callback({ status: 406, code: constants.INCORRECT_ARTICLE_CONTENT_FORMAT, detail: null });
    }

    const generatedUuid = uuid.v4();

    databaseManager.insertQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.news,
      args: { uuid: generatedUuid, title: articleTitle, timestamp: Date.now(), author: accountData.uuid, content: articleContent.replace(/\"/g, '\\"') }

    }, databaseConnection, (error, result) =>
    {
      if(error !== null)
      {
        return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error.message });
      }

      return callback(null, generatedUuid);
    });
  });
}

/****************************************************************************************************/
