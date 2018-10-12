'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonStrings         = require(`${__root}/json/strings/common`);
const webContent            = require(`${__root}/json/share/webcontent`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonRightsGet       = require(`${__root}/functions/common/rights/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    error != null

    ? res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

    commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
    {
      if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      else if(rightsExist == false) res.render('block', { message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null, link: req.headers.referer });

      else
      {
        res.render('root/news/home',
        { 
          account: req.app.locals.account, 
          currentLocation: 'news',
          webContent: webContent,
          strings: { common: commonStrings },
          news: news,
          newsSelected: false,
          intranetRights: rightsData
        });
      }
    });
  });
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    error != null

    ? res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

    commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
    {
      if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      else if(rightsExist == false) res.render('block', { message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null, link: req.headers.referer });

      else
      {
        rightsData.create_articles == false
        ? res.render('block', { message: errors[constants.UNAUTHORIZED_TO_CREATE_ARTICLES], detail: null, link: req.headers.referer })
        : res.render('root/news/create', { account: req.app.locals.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: news });
      }
    });
  });
});

/****************************************************************************************************/

router.get('/:newsUuid', (req, res) =>
{
  commonNewsGet.getNewsIndexFromUuid(req.params.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsIndex) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else
    {
      const startIndex = 0;
      const endIndex = (Math.floor(newsIndex / 10) + 1) * 10;

      commonNewsGet.getLastNewsFromIndex(startIndex, endIndex, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
      {
        error != null

        ? res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

        commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
        {
          if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

          else if(rightsExist == false) res.render('block', { message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null, link: req.headers.referer });

          else
          {
            res.render('root/news/home',
            { 
              account: req.app.locals.account, 
              currentLocation: 'news',
              webContent: webContent,
              strings: { common: commonStrings },
              news: news,
              newsSelected: req.params.newsUuid,
              intranetRights: rightsData
            });
          }
        });
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;