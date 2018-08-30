'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const webContent            = require(`${__root}/json/share/webcontent`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') :

  commonNewsGet.getLastNewsFromIndex(0, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
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
      index: (news.length - 1)
    });
  });
});

/****************************************************************************************************/

router.get('/create', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') :

  commonNewsGet.getLastNewsFromIndex(0, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    error != null
    ? res.render('root/news/create', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: null, error: { message: errors[error.code], detail: error.detail }})
    : res.render('root/news/create', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: news });
  });
});

/****************************************************************************************************/

router.get('/:news', (req, res) =>
{
  req.session.account == undefined ? res.redirect('/') :

  commonNewsGet.getAllNewsData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) res.render('root/news/home', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: null, error: { message: errors[error.code], detail: error.detail }});
    
    else
    {
      var index = null;

      for(var x = 0; x < news.length; x++)
      {
        if(news[x].uuid === req.params.news) index = x;
      }

      if(index == null) res.render('root/news/home', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: null, error: { message: errors[ConstantSourceNode.NEWS_NOT_FOUND], detail: null }});

      else
      {
        var startIndex = null, endIndex = null, newsToReturn = [];

        startIndex = (index - 19) < 0 ? 0 : (index - 19);
        endIndex = (startIndex + 40) > news.length ? news.length : (startIndex + 40);

        for(var x = startIndex; x < endIndex; x++)
        {
          newsToReturn.push(news[x]);
        }

        const currentPage = Math.ceil(news.length / 10) - (Math.ceil((index + 1) / 10));
        const startPage = (currentPage - 4) < 0 ? 0 : (currentPage - 4);
        const endPage = startPage + 8;

        res.render('root/news/home', { account: req.session.account, currentLocation: 'news', webContent: webContent, strings: { common: commonStrings }, news: news, index: index, asideNewsPage: { start: startPage, current: currentPage, end: endPage }});
      }
    }
  });
});

/****************************************************************************************************/

module.exports = router;