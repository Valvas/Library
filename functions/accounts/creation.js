'use strict';

let encrypter = require('../encryption');
let config    = require('../../json/config');
let SQLInsert = require('../database/insert');
let SQLSelect = require('../database/select');

/****************************************************************************************************/

//accountObject -> { emailAddress: string, lastName: string, firstName: string, clearPassword: string, isActivated: boolean, isSuspended: boolean, service: string, isAdmin: boolean }
/*callback -> 
  [false] + [0] : error
  [false] + [1] : account already exists
  [false] + [2] : service does not exist
  [true] + [uuid] : success
*/

module.exports.createNewAccount = function(accountObject, SQLConnector, callback)
{
  SQLSelect.SQLSelectQuery(
  {
    "databaseName": config.database.library_database,
    "tableName": config.database.auth_table,
  
    "args": { "0": "email" },
  
    "where":
    {
      "=":
      {
        "0":
        {
          "key": "email",
          "value": accountObject.emailAddress
        }
      }
    }
  }, SQLConnector, function(success, rows)
  {
    if(success == false) callback(false, 0);

    else if(success == true && rows.length > 0) callback(false, 1)

    else
    {
      !(accountObject.service in require('../../json/services')) ? callback(false, 2) :

      encrypter.encryptPassword(accountObject.clearPassword, function(encryptedPassword)
      {
        encryptedPassword == false ? callback(false, 0) :

        SQLInsert.SQLInsertQuery(
        {
          "databaseName": config.database.library_database,
          "tableName": config.database.auth_table,
        
          "args":
          {
            "email": accountObject.emailAddress,
            "lastname": accountObject.lastName,
            "firstname": accountObject.firstName,
            "password": encryptedPassword,
            "activated": accountObject.isActivated,
            "suspended": accountObject.isSuspended,
            "service": accountObject.service,
            "is_admin": accountObject.isAdmin
          }
        }, SQLConnector, function(success, uuid)
        {
          success ? callback(true, uuid) : callback(false, 0);
        });
      });
    }
  });
}

/****************************************************************************************************/