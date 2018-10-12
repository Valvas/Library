'use strict'

const jwt       = require('jsonwebtoken');
const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkIfTokenIsValid = (token, params, callback) =>
{
  jwt.verify(token, params.tokenSecretKey, (error, decodedToken) =>
  {
    if(error != null) return callback({ status: 406, code: constants.AUTHENTICATION_REQUIRED, detail: error.message });

    return callback(null, decodedToken);
  });
}

/****************************************************************************************************/