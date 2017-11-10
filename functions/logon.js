'use strict';

let encryption        = require('./encryption');
let config            = require('../json/config');

let logon = module.exports = {};

/****************************************************************************************************/

logon.checkIfAccountExistsUsingCredentialsProvided = function(emailAddress, uncryptedPassword, mysqlConnector, callback)
{
  encryption.encryptPassword(uncryptedPassword, function(encryptedPassword)
  {
    encryptedPassword == false ? callback(false) :

    mysqlConnector.query(`SELECT * FROM ${config['database']['library_database']}.${config['database']['auth_table']} WHERE email = "${emailAddress}" AND password = "${encryptedPassword}"`, function(err, result)
    {
      if(err) callback(false);

      else
      {
        result.length == 0 ? callback(true, undefined) : callback(true, result[0]);
      }
    });
  });
}

/****************************************************************************************************/