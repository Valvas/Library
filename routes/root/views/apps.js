'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonAppsGet         = require(`${__root}/functions/common/apps/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    commonAppsGet.getAppsData(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, apps) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      if(apps.length === 0) return res.render('root/apps/home',
      {
        account: req.app.locals.account, 
        currentLocation: 'apps',
        strings: { common: commonStrings }, 
        news: news,
        apps: apps,
        conversationsData: req.app.locals.conversationsData
      });

      var index = 0;

      var browseApps = () =>
      {
        commonAppsGet.checkIfAccountHasAccessToApp(apps[index].name, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, hasAccess) =>
        {
          if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

          apps[index].hasAccess = hasAccess;

          if(apps[index += 1] != undefined) return browseApps();

          return res.render('root/apps/home',
          {
            account: req.app.locals.account, 
            currentLocation: 'apps',
            strings: { common: commonStrings }, 
            news: news,
            apps: apps,
            conversationsData: req.app.locals.conversationsData
          });
        });
      }
      
      browseApps();
    });
  });
});

/****************************************************************************************************/

module.exports = router;