'use strict'

const constants         = require(`${__root}/functions/constants`);
const commonNewsGet     = require(`${__root}/functions/common/news/get`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);
const commonRightsGet   = require(`${__root}/functions/common/rights/get`);

/****************************************************************************************************/

function removeArticle(articleUuid, accountUuid, accountIsAdmin, databaseConnection, globalParameters, callback)
{
  removeArticleCheckIfItExists(articleUuid, accountUuid, accountIsAdmin, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function removeArticleCheckIfItExists(articleUuid, accountUuid, accountIsAdmin, databaseConnection, globalParameters, callback)
{
  commonNewsGet.getNewsData(articleUuid, databaseConnection, globalParameters, (error, articleExists, articleData) =>
  {
    if(error != null) return callback(error);

    if(articleExists == false) return callback({ status: 404, code: constants.NEWS_NOT_FOUND, detail: null });

    if(accountIsAdmin) return removeArticleFromDatabase(articleUuid, databaseConnection, globalParameters, callback);

    return removeArticleGetAccountRights(articleData, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeArticleGetAccountRights(articleData, accountUuid, databaseConnection, globalParameters, callback)
{
  commonRightsGet.checkIfRightsExistsForAccount(accountUuid, databaseConnection, globalParameters, (error, rightsExist, rightsData) =>
  {
    if(error != null) return callback(error);

    if(rightsExist == false) return callback({ status: 404, code: constants.INTRANET_RIGHTS_NOT_FOUND, detail: null });

    if(rightsData.remove_articles || (rightsData.remove_own_articles && articleData.author === accountUuid)) return removeArticleFromDatabase(articleData.uuid, databaseConnection, globalParameters, callback);
    
    return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_THIS_ARTICLE, detail: null });
  });
}

/****************************************************************************************************/

function removeArticleFromDatabase(articleUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.deleteQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.news,
    where: { operator: '=', key: 'uuid', value: articleUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  removeArticle: removeArticle
}

/****************************************************************************************************/