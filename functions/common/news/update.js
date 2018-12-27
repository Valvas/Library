'use strict'

const constants         = require(`${__root}/functions/constants`);
const commonNewsGet     = require(`${__root}/functions/common/news/get`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);
const commonRightsGet   = require(`${__root}/functions/common/rights/get`);

/****************************************************************************************************/

function updateArticle(articleUuid, articleTitle, articleContent, accountData, databaseConnection, globalParameters, callback)
{
  if(articleTitle.length < 1 || articleTitle.length > 255) return callback({ status: 406, code: constants.INCORRECT_ARTICLE_TITLE_FORMAT, detail: null });

  if(articleContent.length < 64) return callback({ status: 406, code: constants.INCORRECT_ARTICLE_CONTENT_FORMAT, detail: null });

  updateArticleCheckIfItExists(articleUuid, articleTitle, articleContent, accountData, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function updateArticleCheckIfItExists(articleUuid, articleTitle, articleContent, accountData, databaseConnection, globalParameters, callback)
{
  commonNewsGet.getNewsData(articleUuid, databaseConnection, globalParameters, (error, articleExists, articleData) =>
  {
    if(error != null) return callback(error);

    if(articleExists == false) return callback({ status: 404, code: constants.NEWS_NOT_FOUND, detail: null });

    return updateArticleCheckAccountRights(articleData, articleTitle, articleContent, accountData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateArticleCheckAccountRights(articleData, articleTitle, articleContent, accountData, databaseConnection, globalParameters, callback)
{
  if(accountData.isAdmin) return updateArticleInsertInDatabase(articleData, articleTitle, articleContent, databaseConnection, globalParameters, callback);

  commonRightsGet.checkIfRightsExistsForAccount(accountData.uuid, databaseConnection, globalParameters, (error, rightsExist, accountRights) =>
  {
    if(error != null) return callback(error);

    if(rightsExist == false) return callback({ status: 404, code: constants.INTRANET_RIGHTS_NOT_FOUND, detail: null });

    if(accountRights.update_articles || (accountRights.update_own_articles && accountData.uuid === articleData.authorUuid)) return updateArticleInsertInDatabase(articleData, articleTitle, articleContent, databaseConnection, globalParameters, callback);

    return callback({ status: 403, code: constants.UNAUTHORIZED_TO_UPDATE_THIS_ARTICLE, detail: null });
  });
}

/****************************************************************************************************/

function updateArticleInsertInDatabase(articleData, articleTitle, articleContent, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.news,
    args: { title: articleTitle, content: articleContent.replace(/\"/g, '\\"') },
    where: { operator: '=', key: 'uuid', value: articleData.uuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  updateArticle: updateArticle
}

/****************************************************************************************************/