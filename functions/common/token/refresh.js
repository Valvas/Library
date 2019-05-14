'use strict'

const jwt       = require('jsonwebtoken');
const constants = require(`${__root}/functions/constants`);

const commonTokenGet    = require(`${__root}/functions/common/token/get`);
const commonTokenCheck  = require(`${__root}/functions/common/token/check`);
const commonAccountsGet = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

function refreshToken(headerCookies, databaseConnection, globalParameters, callback)
{
  refreshTokenRetrieveFromHeaders(headerCookies, databaseConnection, globalParameters, (error, token, keepLogged) =>
  {
    return callback(error, token, keepLogged);
  });
}

/****************************************************************************************************/

function refreshTokenRetrieveFromHeaders(headerCookies, databaseConnection, globalParameters, callback)
{
  commonTokenGet.getAuthTokenFromHeaders(headerCookies, (error, token) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    return refreshTokenCheckItsValidity(token, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function refreshTokenCheckItsValidity(token, databaseConnection, globalParameters, callback)
{
  commonTokenCheck.checkIfTokenIsValid(token, globalParameters, (error, decodedToken) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    return refreshTokenCheckAccount(decodedToken.uuid, decodedToken.keepLogged, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function refreshTokenCheckAccount(accountUuid, keepLogged, databaseConnection, globalParameters, callback)
{
  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    if(accountExists === false)
    {
      return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });
    }

    if(accountData.suspended === true)
    {
      return callback({ status: 403, code: constants.ACCOUNT_SUSPENDED, detail: null });
    }

    return refreshTokenGenerateNewOne(accountUuid, keepLogged, globalParameters, callback);
  });
}

/****************************************************************************************************/

function refreshTokenGenerateNewOne(accountUuid, keepLogged, globalParameters, callback)
{
  if(keepLogged)
  {
    jwt.sign({ uuid: accountUuid, keepLogged: keepLogged }, globalParameters.tokenSecretKey, { expiresIn: (60 * 60 * 24 * 365 * 10) }, (error, token) =>
    {
      if(error)
      {
        return callback({ status: 500, code: constants.ERROR_WHILE_GENERATING_TOKEN, detail: error.message });
      }

      return callback(null, token, keepLogged);
    });
  }

  else
  {
    jwt.sign({ uuid: accountUuid, keepLogged: keepLogged }, globalParameters.tokenSecretKey, { expiresIn: (60 * 60 * 24) }, (error, token) =>
    {
      if(error)
      {
        return callback({ status: 500, code: constants.ERROR_WHILE_GENERATING_TOKEN, detail: error.message });
      }

      return callback(null, token, keepLogged);
    });
  }
}

/****************************************************************************************************/

module.exports =
{
  refreshToken: refreshToken
}
