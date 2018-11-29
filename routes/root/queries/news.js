'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonRightsGet       = require(`${__root}/functions/common/rights/get`);
const commonNewsCreate      = require(`${__root}/functions/common/news/create`);

var router = express.Router();

/****************************************************************************************************/

router.put('/get-news-data', (req, res) =>
{
  if(req.body.newsUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  commonNewsGet.getNewsData(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    if(newsExists == false) return res.status(404).send({ message: errors[constants.NEWS_NOT_FOUND], detail: null });

    return res.status(200).send({ newsData: newsData });
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

    if(rightsData.create_articles == false) return res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_CREATE_ARTICLES], detail: null });

    commonNewsCreate.createNewArticle(req.body.articleTitle, req.body.articleContent, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, createdNewsUuid) =>
    {
      if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      commonNewsGet.getNewsData(createdNewsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
      {
        if(error == null && newsExists) req.app.get('io').in('rootNewsGroup').emit('newsCreated', newsData);
      });

      res.status(201).send({  });
    });
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

    return res.status(200).send({ accountRights: accountRights });
  });
});

/****************************************************************************************************/

module.exports = router;