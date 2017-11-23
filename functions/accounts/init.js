'use strict';

let creation      = require('./creation');
let encrypter     = require('../encryption');
let accounts      = require('../../json/accounts');

/****************************************************************************************************/

module.exports.createAccounts = function(SQLConnector, callback)
{
  let x = 0;
  let log = [];

  let accountCreationLoop = function()
  {
    encrypter.getRandomPassword(function(clearPassword)
    {
      clearPassword == false ? callback(`${log.join('\n') + '\n' + `[ERROR] : server failure, could not create account "${accounts[Object.keys(accounts)[x]].email}" !`}`) :

      creation.createNewAccount(
      {
        "emailAddress": accounts[Object.keys(accounts)[x]].email,
        "lastName": accounts[Object.keys(accounts)[x]].lastname,
        "firstName": accounts[Object.keys(accounts)[x]].firstname,
        "clearPassword": clearPassword,
        "isActivated": accounts[Object.keys(accounts)[x]].activated,
        "isSuspended": accounts[Object.keys(accounts)[x]].suspended,
        "service": accounts[Object.keys(accounts)[x]].service,
        "isAdmin": accounts[Object.keys(accounts)[x]].is_admin
      }, SQLConnector, function(success, uuid)
      {
        if(success == false && uuid == 0) log.push(`[ERROR] : server failure, could not create account "${accounts[Object.keys(accounts)[x]].email}" !`);
        if(success == false && uuid == 1) log.push(`[INFO] : account "${accounts[Object.keys(accounts)[x]].email}" already exists !`);
        if(success == false && uuid == 2) log.push(`[ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" because service "${accounts[Object.keys(accounts)[x]].service}" does not exist !`);

        if(success) log.push(`[SUCCESS] : account "${accounts[Object.keys(accounts)[x]].email}" created with password "${clearPassword}" ! UUID -> ${uuid}`);
          
        Object.keys(accounts)[x += 1] == undefined ? callback(log.join('\n')) : accountCreationLoop();
      });
    });
  }

  Object.keys(accounts)[x] == undefined ? callback('[INFO] : no account to create !') : accountCreationLoop();
}

/****************************************************************************************************/