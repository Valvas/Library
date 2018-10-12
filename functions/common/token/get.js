'use strict'

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.getAuthTokenFromHeaders = (cookies, callback) =>
{
  if(cookies == undefined) return callback({ status: 403, code: constants.AUTHENTICATION_REQUIRED, detail: null });

  var token = null;
  var cookiesToArray = cookies.split('; ');

  for(var x = 0; x < cookiesToArray.length; x++)
  {
    if(cookiesToArray[x].split('=')[0] === 'peiauth') token = cookiesToArray[x].split('=')[1];
  }

  if(token == null) return callback({ status: 403, code: constants.AUTHENTICATION_REQUIRED, detail: null });

  return callback(null, token);
}

/****************************************************************************************************/