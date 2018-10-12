'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const webContent            = require(`${__root}/json/share/webcontent`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonAppsGet         = require(`${__root}/functions/common/apps/get`);
const commonAccessGet       = require(`${__root}/functions/common/access/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    error != null

    ? res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

    commonAppsGet.getAppsData( req.app.get('databaseConnectionPool'), req.app.get('params'), (error, apps) =>
    {
      error != null

      ? res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

      commonAccessGet.getAppsAccess(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, access) =>
      {
        error != null

        ? res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer }) :

        res.render('root/apps/home',
        { 
          account: req.app.locals.account, 
          currentLocation: 'apps',
          webContent: webContent,
          strings: { common: commonStrings }, 
          news: news,
          apps: apps,
          access: access
        });
      });
    });
  });
});

/****************************************************************************************************/

module.exports = router;