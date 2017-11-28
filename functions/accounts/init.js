'use strict';

let encrypter     = require('../encryption');
let rights        = require('../../json/rights');
let config        = require('../../json/config');
let accounts      = require('../../json/accounts');

let SQLSelect     = require('../database/select');
let SQLInsert     = require('../database/insert');
let SQLDelete     = require('../database/delete');

/****************************************************************************************************/

module.exports.createAccounts = function(SQLConnector, callback)
{
  let x = 0;

  let accountCreationLoop = function()
  {
    encrypter.getRandomPassword(function(clearPassword)
    {
      if(clearPassword == false)
      {
        console.log(`[${config.database.library_database}][${config.database.auth_table}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (encryption error) !`);

        Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
      }

      else
      {
        encrypter.encryptPassword(clearPassword, function(encryptedPassword)
        {
          if(encryptedPassword == false)
          {
            console.log(`[${config.database.library_database}][${config.database.auth_table}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (encryption error) !`);
            
            Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
          }

          else
          {
            SQLSelect.SQLSelectQuery(
            {
              "databaseName": config.database.library_database,
              "tableName": config.database.auth_table,
            
              "args":
              {
                "0": "password"
              },
            
              "where":
              {
                "=":
                {
                  "0":
                  {
                    "key": "email",
                    "value": accounts[Object.keys(accounts)[x]].email
                  }
                }
              }
            }, SQLConnector, function(trueOrFalse, rowsOrErrorCode)
            {
              if(trueOrFalse == false)
              {
                console.log(`[${config.database.library_database}][${config.database.auth_table}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (SQL error) !`);
                
                Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
              }

              else
              {
                if(rowsOrErrorCode.length > 0) encryptedPassword = rowsOrErrorCode[0].password;

                SQLDelete.SQLDeleteQuery(
                {
                  "databaseName": config.database.library_database,
                  "tableName": config.database.auth_table,
                
                  "where":
                  {
                    "=":
                    {
                      "0":
                      {
                        "key": "email",
                        "value": accounts[Object.keys(accounts)[x]].email
                      }
                    }
                  }
                }, SQLConnector, function(trueOrFalse, deletedRowsOrErrorCode)
                {
                  if(trueOrFalse == false)
                  {
                    console.log(`[${config.database.library_database}][${config.database.auth_table}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (SQL error) !`);
                    
                    Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
                  }

                  else
                  {
                    SQLInsert.SQLInsertQuery(
                    {
                      "databaseName": config.database.library_database,
                      "tableName": config.database.auth_table,
                    
                      "args":
                      {
                        "email": accounts[Object.keys(accounts)[x]].email,
                        "lastname": accounts[Object.keys(accounts)[x]].lastname,
                        "firstname": accounts[Object.keys(accounts)[x]].firstname,
                        "password": encryptedPassword,
                        "activated": accounts[Object.keys(accounts)[x]].activated,
                        "suspended": accounts[Object.keys(accounts)[x]].suspended,
                        "service": accounts[Object.keys(accounts)[x]].service,
                        "is_admin": accounts[Object.keys(accounts)[x]].is_admin
                      }
                    }, SQLConnector, function(trueOrFalse, entryUuidOrErrorCode)
                    {
                      if(trueOrFalse == false)
                      {
                        console.log(`[${config.database.library_database}][${config.database.auth_table}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (SQL error) !`);
                        
                        Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
                      }

                      else
                      {
                        rowsOrErrorCode.length == 0 ?
                        console.log(`[${config.database.library_database}][${config.database.auth_table}][SUCCESS] : account "${accounts[Object.keys(accounts)[x]].email}" created with password : "${clearPassword}" !`) :
                        console.log(`[${config.database.library_database}][${config.database.auth_table}][SUCCESS] : account "${accounts[Object.keys(accounts)[x]].email}" created with unchanged password !`);
                        
                        Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  if(Object.keys(accounts)[x] == undefined)
  {
    console.log(`[${config.database.library_database}][${config.database.auth_table}][INFO] : no accounts to create !`);
    callback();
  }
  
  else
  {
    accountCreationLoop();
  }
}

/****************************************************************************************************/

module.exports.createRights = function(SQLConnector, callback)
{
  let x = 0;

  let rightsCreationLoop = function()
  {
    SQLSelect.SQLSelectQuery(
    {
      "databaseName": config.database.library_database,
      "tableName": config.database.auth_table,
  
      "args":
      {
        "0": "uuid"
      },
  
      "where":
      {
        "=":
        {
          "0":
          {
            "key": "email",
            "value": rights[Object.keys(rights)[x]].account
          }
        }
      }
    }, SQLConnector, function(trueOrFalse, rowsOrErrorCode)
    {
      if(trueOrFalse == false) console.log(`[${config.database.library_database}][${config.database.rights_table}][ERROR] : could not create rights for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" (SQL error) !`);

      if(rowsOrErrorCode.length == 0)
      {
        console.log(`[${config.database.library_database}][${config.database.rights_table}][ERROR] : could not create rights for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" (account not found) !`);
        
        Object.keys(rights)[x += 1] == undefined ? callback() : rightsCreationLoop();
      }

      else
      {
        SQLDelete.SQLDeleteQuery(
        {
          "databaseName": config.database.library_database,
          "tableName": config.database.rights_table,
      
          "where":
          {
            "=":
            {
              "0":
              {
                "key": "account",
                "value": rowsOrErrorCode[0].uuid
              }
            }
          }
        }, SQLConnector, function(trueOrFalse, deletedRowsOrErrorCode)
        {
          SQLInsert.SQLInsertQuery(
          {
            "databaseName": config.database.library_database,
            "tableName": config.database.rights_table,
        
            "args":
            {
              "account": rowsOrErrorCode[0].uuid,
              "service": rights[Object.keys(rights)[x]].service,
              "upload_files": rights[Object.keys(rights)[x]].upload_files,
              "download_files": rights[Object.keys(rights)[x]].download_files,
              "remove_files": rights[Object.keys(rights)[x]].remove_files,
              "post_comments": rights[Object.keys(rights)[x]].post_comments,
            }
          }, SQLConnector, function(trueOrFalse, entryUuidOrErrorCode)
          {
            trueOrFalse == false ?
            console.log(`[${config.database.library_database}][${config.database.rights_table}][ERROR] : could not create rights for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" (SQL error) !`) :
            console.log(`[${config.database.library_database}][${config.database.rights_table}][SUCCESS] : rights created for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" !`);

            Object.keys(rights)[x += 1] == undefined ? callback() : rightsCreationLoop();
          });
        });
      }
    });
  }

  if(Object.keys(rights)[x] == undefined)
  {
    console.log(`[${config.database.library_database}][${config.database.rights_table}][INFO] : no rights to create !`);
    callback();
  }

  else
  {
    rightsCreationLoop();
  }
}

/****************************************************************************************************/