'use strict';

let encryption        = require('../encryption');
let config            = require('../../json/config');
let accounts          = require('../../json/accounts');

/****************************************************************************************************/

module.exports.createAccounts = function(mysqlConnector, callback)
{
  let x = 0;

  let loopToBrowseAccounts = function(account)
  {
    checkIfAccountAlreadyExists(account, mysqlConnector, function(result)
    {
      if(result == false) callback('ERROR : could not create accounts !');

      else
      {
        x++;

        Object.keys(accounts)[x] == undefined ? callback('INFO : accounts created !') : loopToBrowseAccounts(accounts[Object.keys(accounts)[x]]);
      }
    });
  }

  Object.keys(accounts)[x] == undefined ? callback('INFO : no account to create !') : loopToBrowseAccounts(accounts[Object.keys(accounts)[x]]);
}

/****************************************************************************************************/

function checkIfAccountAlreadyExists(account, mysqlConnector, callback)
{
  mysqlConnector.query(`SELECT id FROM ${config['database']['library_database']}.${config['database']['auth_table']} WHERE email = "${account['email']}"`, function(err, result)
  {
    if(err) callback(false);

    else
    {
      if(result.length > 0)
      {
        mysqlConnector.query(`UPDATE ${config['database']['library_database']}.${config['database']['auth_table']} SET lastname = "${account['lastname']}", firstname = "${account['firstname']}", service = "${account['service']}", is_admin = ${account['is_admin']} WHERE email = "${account['email']}"`, function(err, result)
        {
          err ? callback(false) : callback(true);
        });
      }

      else
      {
        encryption.getRandomPassword(function(uncryptedPassword, encryptedPassword)
        {
          uncryptedPassword == false ? callback(false) :
          
          mysqlConnector.query(`INSERT INTO ${config['database']['library_database']}.${config['database']['auth_table']} (email, lastname, firstname, service, password, activated, suspended, is_admin) VALUES ("${account['email']}", "${account['lastname']}", "${account['firstname']}", "${account['service']}", "${encryptedPassword}", 1, 0, ${account['is_admin']})`, function(err, result)
          {
            err ? callback(false) :

            sendCredentialsByEmail(account['email'], uncryptedPassword, function(result)
            {
              result ? callback(true) : callback(false);
            });
          });
        });
      }
    }
  });
}

/****************************************************************************************************/

function sendCredentialsByEmail(emailAddress, uncryptedPassword, callback)
{
  console.log(uncryptedPassword);

  callback(true);
}

/****************************************************************************************************/