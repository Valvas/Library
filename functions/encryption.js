'use strict';

var bcrypt            = require('bcrypt');
var params            = require(`${__root}/json/config`);
var constants         = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.encryptPassword = (password, callback) =>
{
  bcrypt.hash(password, params.salt, (err, result) =>
  {
    err != undefined ? callback(false, 500, constants.ENCRYPTION_FAILED) : callback(result);
  });
}

/****************************************************************************************************/

module.exports.getRandomPassword = (callback) =>
{
  var password = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var x = 0;

  var loop = () =>
  {
    password += characters.charAt(Math.floor(Math.random() * characters.length));

    (x += 1) < 8 ? loop() : 
      
    bcrypt.hash(password, params.salt, (err, result) =>
    {
      err != undefined ? callback(false, 500, constants.ENCRYPTION_FAILED) : callback(password, result);
    });
  }

  loop();
}

/****************************************************************************************************/