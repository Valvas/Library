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
  if(req.body.currentPage == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'currentPage' });

  else
  {
    commonNewsGet.getLastNewsFromIndex(req.body.currentPage, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsData, pageInfos) =>
    {
      if(error != null) res.status(error.status).send({ message: errors[error.code], detail: error.detail });

      else
      {
        res.status(200).send({ newsData: newsData, pageInfos: pageInfos });
      }
    });
  }
});

/****************************************************************************************************/

router.post('/create-article', (req, res) =>
{
  if(req.body.articleTitle == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleTitle' });

  else if(req.body.articleContent == undefined) res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'articleContent' });

  else
  {
    commonNewsCreate.createNewArticle(req.body.articleTitle, req.body.articleContent, req.session.account.id, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, createdNewsUuid) =>
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

module.exports = router;