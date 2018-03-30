'use strict'

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkEmailAddressFormat = (emailAddress, callback) =>
{
  if(emailAddress == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else
  {
    callback(null, new RegExp('^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$').test(emailAddress));
  }
}

/****************************************************************************************************/