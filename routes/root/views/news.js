'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonRightsGet       = require(`${__root}/functions/common/rights/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      if(rightsExist == false) return res.render('block', { message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null, link: req.headers.referer });

      res.render('root/news/home',
      { 
        account: req.app.locals.account, 
        currentLocation: 'news',
        strings: { common: commonStrings },
        news: news,
        newsSelected: false,
        intranetRights: rightsData,
        conversationsData: req.app.locals.conversationsData
      });
    });
  });
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      if(rightsExist == false) return res.render('block', { message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null, link: req.headers.referer });

      if(rightsData.create_articles == false && req.app.locals.account.isAdmin == false) return res.render('block', { message: errors[constants.UNAUTHORIZED_TO_CREATE_ARTICLES], detail: null, link: '/' });

      res.render('root/news/create', { account: req.app.locals.account, currentLocation: 'news', strings: { common: commonStrings }, news: news, conversationsData: req.app.locals.conversationsData });
    });
  });
});

/****************************************************************************************************/

router.get('/update/:articleUuid', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    commonNewsGet.getNewsData(req.params.articleUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, articleExists, articleData) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      if(articleExists == false) return res.render('block', { message: errors[constants.NEWS_NOT_FOUND], detail: null, link: req.headers.referer });

      commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
      {
        if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        if(rightsExist == false) return res.render('block', { message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null, link: req.headers.referer });

        if(rightsData.update_articles == false && req.app.locals.account.isAdmin == false && (rightsData.update_own_articles == false || articleData.authorUuid !== req.app.locals.account.uuid)) return res.render('block', { message: errors[constants.UNAUTHORIZED_TO_UPDATE_THIS_ARTICLE], detail: null, link: '/' });

        res.render('root/news/update', { account: req.app.locals.account, currentLocation: 'news', strings: { common: commonStrings }, news: news, articleData: articleData, conversationsData: req.app.locals.conversationsData });
      });
    });
  });
});

/****************************************************************************************************/

router.get('/:newsUuid', (req, res) =>
{
  commonNewsGet.getNewsIndexFromUuid(req.params.newsUuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, newsIndex) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    const startIndex = 0;
    const endIndex = (Math.floor(newsIndex / 10) + 1) * 10;

    commonNewsGet.getLastNewsFromIndex(startIndex, endIndex, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      commonRightsGet.checkIfRightsExistsForAccount(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, rightsExist, rightsData) =>
      {
        if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        if(rightsExist == false) return res.render('block', { message: errors[constants.INTRANET_RIGHTS_NOT_FOUND], detail: null, link: req.headers.referer });

        res.render('root/news/home',
        { 
          account: req.app.locals.account, 
          currentLocation: 'news',
          strings: { common: commonStrings },
          news: news,
          newsSelected: req.params.newsUuid,
          intranetRights: rightsData,
          conversationsData: req.app.locals.conversationsData
        });
      });
    });
  });
});

/****************************************************************************************************/

module.exports = router;