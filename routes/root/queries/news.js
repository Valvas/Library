'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const success               = require(`${__root}/json/success`);
const commonAppStrings      = require(`${__root}/json/strings/common`);
const constants             = require(`${__root}/functions/constants`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonRightsGet       = require(`${__root}/functions/common/rights/get`);
const commonNewsCreate      = require(`${__root}/functions/common/news/create`);
const commonNewsDelete      = require(`${__root}/functions/common/news/delete`);
const commonNewsUpdate      = require(`${__root}/functions/common/news/update`);
const commonNewsComment     = require(`${__root}/functions/common/news/comment`);

var router = express.Router();

/****************************************************************************************************/

router.put('/get-news-data', (req, res) =>
{
  if(req.body.newsUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  commonNewsGet.getNewsData(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(newsExists == false) return res.status(404).send({ message: errors[constants.NEWS_NOT_FOUND], detail: null });

    commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      if(rightsExist == false) return res.status(404).send({ message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null });

      return res.status(200).send({ newsData: newsData, accountRights: rightsData, accountData: req.app.locals.account, commonStrings: commonAppStrings });
    });
  });
});

/****************************************************************************************************/

router.get('/get-last-articles', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, articlesData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ articlesData: articlesData });
  });
});

/****************************************************************************************************/

router.put('/get-news-data-from-index', (req, res) =>
{
  if(req.body.newsUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  commonNewsGet.getNewsIndexFromUuid(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsIndex) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    const startIndex = 0;
    const endIndex = (Math.floor(newsIndex / 10) + 1) * 10;

    commonNewsGet.getLastNewsFromIndex(startIndex, endIndex, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsData) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      return res.status(200).send({ newsData: newsData });
    });
  });
});

/****************************************************************************************************/

router.put('/get-news-data-after-index', (req, res) =>
{
  if(req.body.newsUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  commonNewsGet.getNewsIndexFromUuid(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsIndex) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    const startIndex = 0;
    const endIndex = (Math.floor(newsIndex / 10) + 2) * 10;

    commonNewsGet.getLastNewsFromIndex(startIndex, endIndex, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsData) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      return res.status(200).send({ newsData: newsData });
    });
  });
});

/****************************************************************************************************/

router.post('/create-article', (req, res) =>
{
  if(req.body.articleTitle == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleTitle' });

  if(req.body.articleContent == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleContent' });

  commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(rightsExist == false) return res.status(404).send({ message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null });

    if(rightsData.create_articles == false && req.app.locals.account.isAdmin == false) return res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_CREATE_ARTICLES], detail: null });

    commonNewsCreate.createNewArticle(req.body.articleTitle, req.body.articleContent, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, createdNewsUuid) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      commonNewsGet.getNewsData(createdNewsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
      {console.log(newsExists);
        if(error == null && newsExists) req.app.get('io').in('rootNewsGroup').emit('newsCreated', newsData, commonAppStrings);
      });

      res.status(201).send({  });
    });
  });
});

/****************************************************************************************************/

router.put('/update-article', (req, res) =>
{
  if(req.body.articleUuid == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleUuid' });
  if(req.body.articleTitle == undefined)    return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleTitle' });
  if(req.body.articleContent == undefined)  return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleContent' });

  commonNewsUpdate.updateArticle(req.body.articleUuid, req.body.articleTitle, req.body.articleContent, req.app.locals.account, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in('rootNewsGroup').emit('articleUpdated', { articleUuid: req.body.articleUuid, articleTitle: req.body.articleTitle, articleContent: req.body.articleContent }, commonAppStrings);

    res.status(200).send({ message: success[constants.ARTICLE_SUCCESSFULLY_UPDATED] });
  });
});

/****************************************************************************************************/

router.put('/remove-article', (req, res) =>
{
  if(req.body.articleUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleUuid' });

  commonNewsDelete.removeArticle(req.body.articleUuid, req.app.locals.account.uuid, req.app.locals.account.isAdmin, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in('rootNewsGroup').emit('removedArticle', req.body.articleUuid, commonAppStrings);

    return res.status(200).send({ message: success[constants.ARTICLE_SUCCESSFULLY_REMOVED] });
  });
});

/****************************************************************************************************/

router.put('/is-my-article', (req, res) =>
{
  if(req.body.newsUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  commonNewsGet.getNewsData(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(newsExists == false) return res.status(404).send({ message: errors[constants.NEWS_NOT_FOUND], detail: null });

    if(req.session.account.uuid === newsData.author) return res.status(200).send({ isMine: true, myRights: req.session.account.rights.intranet });

    return res.status(200).send({ isMine: false });
  });
});

/****************************************************************************************************/

router.get('/get-rights-on-articles', (req, res) =>
{
  commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, accountRights) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(rightsExist == false) return res.status(404).send({ message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null });

    return res.status(200).send({ accountRights: accountRights, accountData: req.app.locals.account, commonStrings: commonAppStrings });
  });
});

/****************************************************************************************************/

router.post('/add-comment-on-article', (req, res) =>
{
  if(req.body.articleUuid == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleUuid' });
  if(req.body.commentParent == undefined)   return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentParent' });
  if(req.body.commentContent == undefined)  return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentContent' });

  commonNewsComment.addCommentOnArticle(req.body.articleUuid, req.body.commentContent, req.body.commentParent.length === 0 ? null : req.body.commentParent, req.app.locals.account, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, commentData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
    {
      if(error == null && rightsExist) req.app.get('io').in('rootNewsGroup').emit('commentPostedOnArticle', commentData, req.body.articleUuid, req.app.locals.account, rightsData, commonAppStrings);
    });

    res.status(201).send({ message: success[constants.ARTICLE_COMMENT_CREATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.put('/update-comment-on-article', (req, res) =>
{
  if(req.body.commentUuid == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentUuid' });
  if(req.body.articleUuid == undefined)     return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleUuid' });
  if(req.body.commentContent == undefined)  return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentContent' });

  commonNewsComment.updateComment(req.body.commentUuid, req.body.commentContent, req.app.locals.account, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in('rootNewsGroup').emit('commentUpdatedOnArticle', req.body.commentUuid, req.body.commentContent, req.body.articleUuid, commonAppStrings);

    res.status(201).send({ message: success[constants.ARTICLE_COMMENT_UPDATED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.delete('/remove-comment-on-article', (req, res) =>
{
  if(req.body.articleUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleUuid' });
  if(req.body.commentUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentUuid' });

  commonNewsComment.removeComment(req.body.commentUuid, req.app.locals.account, req.app.get('databaseConnectionPool'), req.app.get('params'), (error) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in('rootNewsGroup').emit('commentRemovedOnArticle', req.body.commentUuid, req.body.articleUuid, commonAppStrings);

    res.status(201).send({ message: success[constants.ARTICLE_COMMENT_REMOVED_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.put('/get-comment-data', (req, res) =>
{
  if(req.body.commentUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'commentUuid' });

  commonNewsComment.checkIfCommentExists(req.body.commentUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, commentExists, commentData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(commentExists == false) return res.status(404).send({ message: errors[constants.ARTICLE_COMMENT_NOT_FOUND], detail: null });

    return res.status(200).send({ commentData: commentData });
  });
});

/****************************************************************************************************/

module.exports = router;
