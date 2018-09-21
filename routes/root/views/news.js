'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);
const commonStrings         = require(`${__root}/json/strings/common`);
const webContent            = require(`${__root}/json/share/webcontent`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') :

  commonNewsGet.getLastNewsFromIndex(0, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news, pageInfos) =>
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
      pageInfos: pageInfos,
      newsSelected: (news.length > 0) ? news[0][0].uuid : null
    });
  });
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') :

  commonNewsGet.getLastNewsFromIndex(0, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news, pageInfos) =>
  {
    error != null
    ? res.render('root/news/create', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: null, error: { message: errors[error.code], detail: error.detail }})
    : res.render('root/news/create', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: news, pageInfos: pageInfos });
  });
});

/****************************************************************************************************/

router.get('/:news', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') :

  commonNewsGet.getLastNewsFromIndex(0, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news, pageInfos) =>
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
      pageInfos: pageInfos,
      newsSelected: req.params.news
    });
  });
});

/****************************************************************************************************/

module.exports = router;