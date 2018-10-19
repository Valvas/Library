'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    else
    {
      res.render('root/home',
      {
        account: req.app.locals.account,
        currentLocation: 'home',
        strings: { common: commonStrings },
        news: news
      });
    }
  });
});

/****************************************************************************************************/

module.exports = router;