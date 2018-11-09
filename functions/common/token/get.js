'use strict'

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.getAuthTokenFromHeaders = (cookies, callback) =>
{
  if(cookies == undefined) return callback({ status: 403, code: constants.AUTHENTICATION_REQUIRED, detail: null });

  var token = null;

  const cookiesToArray = cookies.split('; ');

  for(var x = 0; x < cookiesToArray.length; x++)
  {
    if(cookiesToArray[x].split('=')[0] === 'peiauth') token = cookiesToArray[x].split('=')[1];
  }

  if(token == null) return callback({ status: 403, code: constants.AUTHENTICATION_REQUIRED, detail: null });

  return callback(null, token);
}

/****************************************************************************************************/

module.exports.getInitTokenFromHeaders = (cookies, callback) =>
{
  if(cookies == undefined) return callback(null, false);

  var token = null;

  const cookiesToArray = cookies.split('; ');

  cookiesToArray.forEach((cookie) =>
  {
    if(cookie.split('=')[0] === 'peiinit') token = cookie.split('=')[1];
  });

  if(token == null) return callback(null, false);

  return callback(null, true, token);
}

/****************************************************************************************************/