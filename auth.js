'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);

const commonTokenGet        = require(`${__root}/functions/common/token/get`);
const commonTokenCheck      = require(`${__root}/functions/common/token/check`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

var app = express();

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  if(req.headers.cookie == undefined) res.redirect('/');

  else
  {
    commonTokenGet.getAuthTokenFromHeaders(req.headers.cookie, (error, token) =>
    {
      error != null ? res.render('block', { message: errors[error.code], detail: error.detail, link: '/' }) :

      commonTokenCheck.checkIfTokenIsValid(token, req.app.get('params'), (error, decodedToken) =>
      {
        error != null ? res.render('block', { message: errors[constants.AUTHENTICATION_REQUIRED], detail: null, link: '/' }) :

        commonAccountsGet.checkIfAccountExistsFromUuid(decodedToken.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
        {
          if(error != null) res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

          else if(accountExists == false) res.render('block', { message: errors[constants.ACCOUNT_NOT_FOUND], detail: null, link: req.headers.referer });

          else
          {
            req.app.locals.account = accountData;

            next();
          }
        });
      });
    });
  }
};

/*****************************************************************************************************************************/