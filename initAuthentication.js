'use strict'

const errors                = require(`${__root}/json/errors`);
const constants             = require(`${__root}/functions/constants`);

const commonTokenGet        = require(`${__root}/functions/common/token/get`);
const commonTokenCheck      = require(`${__root}/functions/common/token/check`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/*****************************************************************************************************************************/

module.exports = (req, res, next) =>
{
  req.app.locals.hasInitSession = true;

  if(req.headers.cookie == undefined) req.app.locals.hasInitSession = false;

  commonTokenGet.getInitTokenFromHeaders(req.headers.cookie, (error, tokenExists, token) =>
  {
    if(error != null) return res.render('block', { message: errors[error.code], detail: error.detail, link: '/' });

    if(tokenExists == false)
    {
      req.app.locals.hasInitSession = false;

      return next();
    }

    commonTokenCheck.checkIfTokenIsValid(token, req.app.get('params'), (error, decodedToken) =>
    {
      if(error != null) req.app.locals.hasInitSession = false;

      next();
    });
  });
};

/*****************************************************************************************************************************/