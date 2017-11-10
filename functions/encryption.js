let bcrypt            = require('bcrypt');
let config            = require('../json/config');

module.exports.encryptPassword = function(password, callback)
{
  bcrypt.hash(password, config['salt'], function(err, result)
  {
    err != undefined ? callback(false) : callback(result);
  });
}

module.exports.getRandomPassword = function(callback)
{
  let password = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let i = 0;

  let loop = function()
  {
      i++;

      password += characters.charAt(Math.floor(Math.random() * characters.length));

      i < 8 ? loop() : 
      
      bcrypt.hash(password, config['salt'], function(err, result)
      {
        err != undefined ? callback(false) : callback(password, result);
      });
  }

  loop();
}