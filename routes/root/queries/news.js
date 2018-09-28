'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonNewsCreate      = require(`${__root}/functions/common/news/create`);

var router = express.Router();

/****************************************************************************************************/

router.put('/get-news-data', (req, res) =>
{
  if(req.body.newsUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  else
  {
    commonNewsGet.getNewsData(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else if(newsExists == false) res.status(404).send({ message: errors[constants.NEWS_NOT_FOUND], detail: null });

      else
      {
        res.status(200).send({ newsData: newsData });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/get-news-data-from-index', (req, res) =>
{
  if(req.body.newsUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  else
  {
    commonNewsGet.getNewsIndexFromUuid(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsIndex) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        const startIndex = 0;
        const endIndex = (Math.floor(newsIndex / 10) + 1) * 10;

        commonNewsGet.getLastNewsFromIndex(startIndex, endIndex, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsData) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          else
          {
            res.status(200).send({ newsData: newsData });
          }
        });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/get-news-data-after-index', (req, res) =>
{
  if(req.body.newsUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  else
  {
    commonNewsGet.getNewsIndexFromUuid(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsIndex) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        const startIndex = 0;
        const endIndex = (Math.floor(newsIndex / 10) + 2) * 10;

        commonNewsGet.getLastNewsFromIndex(startIndex, endIndex, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsData) =>
        {
          if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

          else
          {
            res.status(200).send({ newsData: newsData });
          }
        });
      }
    });
  }
});

/****************************************************************************************************/

router.post('/create-article', (req, res) =>
{
  if(req.session.account.rights.intranet.create_articles == false) res.status(403).send({ message: errors[constants.UNAUTHORIZED_TO_CREATE_ARTICLES], detail: null });

  else if(req.body.articleTitle == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleTitle' });

  else if(req.body.articleContent == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleContent' });

  else
  {
    commonNewsCreate.createNewArticle(req.body.articleTitle, req.body.articleContent, req.session.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, createdNewsUuid) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(201).send({  });

        commonNewsGet.getNewsData(createdNewsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
        {
          if(error == null && newsExists) req.app.get('io').in('rootNewsGroup').emit('newsCreated', newsData);
        });
      }
    });
  }
});

/****************************************************************************************************/

router.put('/is-my-article', (req, res) =>
{
  if(req.body.newsUuid == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'newsUuid' });

  else
  {
    commonNewsGet.getNewsData(req.body.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsExists, newsData) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else if(newsExists == false) res.status(404).send({ message: errors[constants.NEWS_NOT_FOUND], detail: null });

      else
      {
        req.session.account.uuid === newsData.author
        ? res.status(200).send({ isMine: true, myRights: req.session.account.rights.intranet })
        : res.status(200).send({ isMine: false });
      }
    });
  }
});

/****************************************************************************************************/

module.exports = router;