'use strict';

const bcrypt            = require('bcrypt');
const params            = require(`${__root}/json/params`);
const constants         = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.encryptPassword = (password, callback) =>
{
  bcrypt.hash(password, params.salt, (error, result) =>
  {
    error != undefined ? callback({status: 500, code: constants.ENCRYPTION_FAILED }) : callback(null, result);
  });
}

/****************************************************************************************************/

module.exports.getRandomPassword = (callback) =>
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

  var loop = () =>
  {
    password += characters.charAt(Math.floor(Math.random() * characters.length));

    (x += 1) < 32 ? loop() : callback(null, password);
  }

  loop();
}

/****************************************************************************************************/