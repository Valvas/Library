'use strict';

const bcrypt            = require('bcrypt');
const constants         = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.encryptPassword = (password, params, callback) =>
{
  bcrypt.hash(password, params.salt, (error, result) =>
  {
    error != undefined ? callback({status: 500, code: constants.ENCRYPTION_FAILED }) : callback(null, result);
  });
}

/****************************************************************************************************/

module.exports.getRandomPassword = (params, callback) =>
{
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var password = '', x = 0;

  var loop = () =>
  {
    password += characters.charAt(Math.floor(Math.random() * characters.length));

    (x += 1) < 8 ? loop() : 
      
    bcrypt.hash(password, params.salt, (error, result) =>
    {
      error != undefined ? callback({ status: 500, code: constants.ENCRYPTION_FAILED }) : callback(null, { clear: password, encrypted: result });
    });
  }

  loop();
}

/****************************************************************************************************/

module.exports.getInitPassword = (callback) =>
{
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var password = '', x = 0;

  for(var x = 0; x < 32; x++)
  {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return callback(null, password);
}

/****************************************************************************************************/