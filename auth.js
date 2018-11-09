'use strict'

const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);

const commonTokenGet        = require(`${__root}/functions/common/token/get`);
const commonTokenCheck      = require(`${__root}/functions/common/token/check`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  if(req.headers.cookie == undefined) return res.redirect('/');

  commonTokenGet.getAuthTokenFromHeaders(req.headers.cookie, (error, token) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/' });

    commonTokenCheck.checkIfTokenIsValid(token, req.app.get('params'), (error, decodedToken) =>
    {
      if(error != null) return res.render('block', { message: errors[constants.AUTHENTICATION_REQUIRED], detail: null, link: '/' });

      commonAccountsGet.checkIfAccountExistsFromUuid(decodedToken.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountExists, accountData) =>
      {
        if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: req.headers.referer });

        if(accountExists == false) return res.render('block', { message: errors[constants.ACCOUNT_NOT_FOUND], detail: null, link: req.headers.referer });

        req.app.locals.account = accountData;

        next();
      });
    });
  });
};

/*****************************************************************************************************************************/