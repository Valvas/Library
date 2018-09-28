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
  req.session.account == undefined ? res.redirect('/') :

  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    error != null

    ? res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

    res.render('root/news/home',
    { 
      account: req.session.account, 
      currentLocation: 'news',
      webContent: webContent,
      strings: { common: commonStrings },
      news: news,
      newsSelected: false,
      intranetRights: req.session.account.rights.intranet
    });
  });
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  if(req.session.account == undefined) res.redirect('/');

  else if(req.session.account.rights.intranet.create_articles == false) res.render('block', { message: errors[constants.UNAUTHORIZED_TO_CREATE_ARTICLES], detail: null, link: req.headers.referer });

  else
  {
    commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news, pageInfos) =>
    {
      error != null
      ? res.render('root/news/create', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: null, error: { message: errors[error.code], detail: error.detail }})
      : res.render('root/news/create', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: news, pageInfos: pageInfos });
    });
  }
});

/****************************************************************************************************/

router.get('/:newsUuid', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') :

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

        res.render('root/news/home',
        { 
          account: req.session.account, 
          currentLocation: 'news',
          webContent: webContent,
          strings: { common: commonStrings },
          news: news,
          newsSelected: req.params.newsUuid,
          intranetRights: req.session.account.rights.intranet
        });
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;