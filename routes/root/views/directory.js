'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const commonStrings         = require(`${__root}/json/strings/common`);
const commonNewsGet         = require(`${__root}/functions/common/news/get`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

var router = express.Router();

/****************************************************************************************************/

router.get('/', (req, res) =>
{
  commonNewsGet.getLastNewsFromIndex(0, 10, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, news) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

    commonAccountsGet.getAllAccountsWidthPictures(req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accounts) =>
    {
      if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

      res.render('root/directory/home',
      {
        account: req.app.locals.account,
        currentLocation: 'directory',
        strings: { common: commonStrings },
        news: news,
        accounts: accounts
      });
    });
  });
});

/****************************************************************************************************/

module.exports = router;