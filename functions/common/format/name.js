'use strict'

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkNameFormat = (name, callback) =>
{
  if(name == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else
  {
    callback(null, new RegExp('[a-zA-Z]+-?[a-zA-Z]+').test(name));
  }
}

/****************************************************************************************************/