'use strict'

const uuid              = require('uuid');
const commonAppStrings  = require(`${__root}/json/strings/common`);
const constants         = require(`${__root}/functions/constants`);
const commonNewsGet     = require(`${__root}/functions/common/news/get`);
const databaseManager   = require(`${__root}/functions/database/MySQLv3`);
const commonRightsGet   = require(`${__root}/functions/common/rights/get`);
const commonFormatDate  = require(`${__root}/functions/common/format/date`);
const commonAccountsGet = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/
/* Get Article Comments */
/****************************************************************************************************/

function getArticleComments(articleUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.newsComments,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'article_uuid', value: articleUuid }, 1: { operator: '=', key: 'parent_comment', value: '' } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    getArticleCommentsBrowse(result, databaseConnection, globalParameters, (error, commentsArray) =>
    {
      return callback(error, commentsArray);
    });
  });
}

/****************************************************************************************************/

function getArticleCommentsBrowse(currentComments, databaseConnection, globalParameters, callback)
{
  var index = 0, commentsArray = [];

  var browseLoop = () =>
  {
    getArticleCommentsBuildCommentData(currentComments[index], databaseConnection, globalParameters, (error, commentData) =>
    {
      if(error != null) return callback(error);

      getArticleCommentsFindCommentChildren(currentComments[index].uuid, databaseConnection, globalParameters, (error, commentChildren) =>
      {
        if(error != null) return callback(error);

        commentsArray.push(commentData);

        if(commentChildren.length === 0)
        {
          currentComments[index += 1] == undefined
          ? callback(null, commentsArray)
          : browseLoop();
        }

        else
        {
          getArticleCommentsBrowse(commentChildren, databaseConnection, globalParameters, (error, resultArray) =>
          {
            if(error != null) return callback(error);

            commentsArray[index].commentChildren = resultArray;

            currentComments[index += 1] == undefined
            ? callback(null, commentsArray)
            : browseLoop();
          });
        }
      });
    });
  }

  browseLoop();
}

/****************************************************************************************************/

function getArticleCommentsBuildCommentData(commentData, databaseConnection, globalParameters, callback)
{
  commonFormatDate.getStringifiedDateTimeFromTimestampAsync(commentData.timestamp, (error, stringifyDate) =>
  {
    if(error != null) return callback(error);

    commonAccountsGet.checkIfAccountExistsFromUuid(commentData.account_uuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      var builtCommentData = { commentUuid: commentData.uuid, commentContent: commentData.is_removed === 1 ? commonAppStrings.root.news.articleCommentRemovedContent : commentData.content, commentDate: stringifyDate, commentAuthorUuid: accountData.uuid, commentAuthor: accountExists ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}` : 'Utilisateur supprimé', commentRemoved: commentData.is_removed === 1, commentUpdated: commentData.is_updated === 1, commentChildren: [] };

      return callback(null, builtCommentData);
    });
  });
}

/****************************************************************************************************/

function getArticleCommentsFindCommentChildren(commentUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.newsComments,
    args: [ '*' ],
    where: { operator: '=', key: 'parent_comment', value: commentUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, result);
  });
}

/****************************************************************************************************/
/* Check If Comment Exists */
/****************************************************************************************************/

function checkIfCommentExists(commentUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.newsComments,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: commentUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, false);

    commonFormatDate.getStringifiedDateTimeFromTimestampAsync(result[0].timestamp, (error, stringifiedDate) =>
    {
      if(error != null) return callback(error);

      commonAccountsGet.checkIfAccountExistsFromUuid(result[0].account_uuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
      {
        if(error != null) return callback(error);

        if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

        const commentData =
        {
          commentUuid: result[0].uuid,
          commentArticle: result[0].article_uuid,
          commentContent: result[0].is_removed === 1 ? commonAppStrings.root.news.articleCommentRemovedContent : result[0].content,
          commentAuthorUuid: result[0].account_uuid,
          commentAuthor: `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}`,
          commentTimestamp: result[0].timestamp,
          commentDate: stringifiedDate,
          commentParent: result[0].parent_comment,
          commentRemoved: result[0].is_removed === 1,
          commentUpdated: result[0].is_updated === 1
        }

        return callback(null, true, commentData);
      });
    });
  });
}

/****************************************************************************************************/
/* Add Comment On Article */
/****************************************************************************************************/

function addCommentOnArticle(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, callback)
{
  if(new RegExp('^(\\S)+((\\s*)?(\\S)+)*$').test(commentContent) === false)
  {
    return callback({ status: 406, code: constants.ARTICLE_COMMENT_INCORRECT_FORMAT, detail: null });
  }

  addCommentOnArticleCheckIfArticleExists(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, (error, commentData) =>
  {
    return callback(error, commentData);
  });
}

/****************************************************************************************************/

function addCommentOnArticleCheckIfArticleExists(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, callback)
{
  commonNewsGet.getNewsData(articleUuid, databaseConnection, globalParameters, (error, articleExists, articleData) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    if(articleExists === false)
    {
      return callback({ status: 404, code: constants.NEWS_NOT_FOUND, detail: null });
    }

    if(parentComment === null)
    {
      return addCommentOnArticleInsertInDatabase(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, callback);
    }

    return addCommentOnArticleCheckIfParentCommentExists(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addCommentOnArticleCheckIfParentCommentExists(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, callback)
{
  checkIfCommentExists(parentComment, databaseConnection, globalParameters, (error, commentExists, commentData) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    if(commentExists === false)
    {
      return callback({ status: 404, code: constants.ARTICLE_PARENT_COMMENT_NOT_FOUND, detail: null });
    }

    return addCommentOnArticleInsertInDatabase(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addCommentOnArticleInsertInDatabase(articleUuid, commentContent, parentComment, accountData, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();
  const generatedTimestamp = Date.now();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.newsComments,
    args: { uuid: generatedUuid, account_uuid: accountData.uuid, timestamp: generatedTimestamp, content: commentContent.replace(/\"/g, '\\"'), parent_comment: parentComment, article_uuid: articleUuid, is_removed: 0, is_updated: 0 }

  }, databaseConnection, (error) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    const commentData =
    {
      commentUuid: generatedUuid,
      commentArticle: articleUuid,
      commentContent: commentContent,
      commentAuthor: accountData.uuid,
      commentTimestamp: generatedTimestamp,
      commentParent: parentComment,
      commentRemoved: false
    }

    return addCommentOnArticleBuildDataFromInsertedComment(commentData, accountData, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addCommentOnArticleBuildDataFromInsertedComment(commentData, accountData, globalParameters, callback)
{
  commonFormatDate.getStringifiedDateTimeFromTimestampAsync(commentData.commentTimestamp, (error, stringifyDate) =>
  {
    if(error != null) return callback(error);

    commentData.commentAuthorUuid = commentData.commentAuthor;
    commentData.commentAuthor = `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.toUpperCase()}`;
    commentData.commentRemoved = false;
    commentData.commentChildren = [];
    commentData.commentDate = stringifyDate;

    return callback(null, commentData);
  });
}

/****************************************************************************************************/
/* Update Comment */
/****************************************************************************************************/

function updateComment(commentUuid, commentContent, accountData, databaseConnection, globalParameters, callback)
{
  if(new RegExp('^(\\S)+((\\s*)?(\\S)+)*$').test(commentContent) == false) return callback({ status: 406, code: constants.ARTICLE_COMMENT_INCORRECT_FORMAT, detail: null });

  updateCommentCheckIfCommentExists(commentUuid, commentContent, accountData, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function updateCommentCheckIfCommentExists(commentUuid, commentContent, accountData, databaseConnection, globalParameters, callback)
{
  checkIfCommentExists(commentUuid, databaseConnection, globalParameters, (error, commentExists, commentData) =>
  {
    if(error != null) return callback(error);

    if(commentExists == false) return callback({ status: 404, code: constants.ARTICLE_COMMENT_NOT_FOUND, detail: null });

    if(accountData.isAdmin) return updateCommentInDatabase(commentUuid, commentContent, accountData.uuid, databaseConnection, globalParameters, callback);

    return updateCommentCheckIfAccountIsAuthorized(commentData, commentContent, accountData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function updateCommentCheckIfAccountIsAuthorized(commentData, commentContent, accountData, databaseConnection, globalParameters, callback)
{
  commonRightsGet.checkIfRightsExistsForAccount(accountData.uuid, databaseConnection, globalParameters, (error, rightsExist, rightsData) =>
  {
    if(error != null) return callback(error);

    if(rightsExist == false) return callback({ status: 404, code: constants.INTRANET_RIGHTS_NOT_FOUND, detail: null });

    if(rightsData.update_article_comments || (rightsData.update_article_own_comments && commentData.commentAuthor === accountData.uuid)) return updateCommentInDatabase(commentData.commentUuid, commentContent, accountData.uuid, databaseConnection, globalParameters, callback);

    return callback({ status: 403, code: constants.UNAUTHORIZED_TO_UPDATE_THIS_ARTICLE_COMMENT, detail: null });
  });
}

/****************************************************************************************************/

function updateCommentInDatabase(commentUuid, commentContent, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.newsComments,
    args: { content: commentContent.replace(/\"/g, '\\"'), is_updated: 1, timestamp: Date.now(), account_uuid: accountUuid },
    where: { operator: '=', key: 'uuid', value: commentUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/
/* Remove Comment */
/****************************************************************************************************/

function removeComment(commentUuid, accountData, databaseConnection, globalParameters, callback)
{
  removeCommentCheckIfCommentExists(commentUuid, accountData, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function removeCommentCheckIfCommentExists(commentUuid, accountData, databaseConnection, globalParameters, callback)
{
  checkIfCommentExists(commentUuid, databaseConnection, globalParameters, (error, commentExists, commentData) =>
  {
    if(error != null) return callback(error);

    if(commentExists == false) return callback({ status: 404, code: constants.ARTICLE_COMMENT_NOT_FOUND, detail: null });

    return removeCommentCheckIfAccountIsAuthorized(commentData, accountData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function removeCommentCheckIfAccountIsAuthorized(commentData, accountData, databaseConnection, globalParameters, callback)
{
  if(accountData.isAdmin) return removeCommentUpdateStatusInDatabase(commentData.commentUuid, databaseConnection, globalParameters, callback);

  commonRightsGet.checkIfRightsExistsForAccount(accountData.uuid, databaseConnection, globalParameters, (error, rightsExist, rightsData) =>
  {
    if(error != null) return callback(error);

    if(rightsExist == false) return callback({ status: 404, code: constants.INTRANET_RIGHTS_NOT_FOUND, detail: null });

    if(rightsData.remove_article_comments || (rightsData.remove_article_own_comments && commentData.commentAuthor === accountData.uuid)) return removeCommentUpdateStatusInDatabase(commentData.commentUuid, databaseConnection, globalParameters, callback);

    return callback({ status: 403, code: constants.UNAUTHORIZED_TO_REMOVE_THIS_ARTICLE_COMMENT, detail: null });
  });
}

/****************************************************************************************************/

function removeCommentUpdateStatusInDatabase(commentUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.newsComments,
    args: { is_removed: 1 },
    where: { operator: '=', key: 'uuid', value: commentUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/

module.exports =
{
  updateComment: updateComment,
  removeComment: removeComment,
  getArticleComments: getArticleComments,
  addCommentOnArticle: addCommentOnArticle,
  checkIfCommentExists: checkIfCommentExists
}

/****************************************************************************************************/
