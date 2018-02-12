'use strict';

var params              = require(`${__root}/json/config`);
var rights              = require(`${__root}/json/rights`);
var accounts            = require(`${__root}/json/accounts`);
var encrypter           = require(`${__root}/functions/encryption`);
var databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.createAccounts = (databaseConnector, callback) =>
{console.log(true);
  var x = 0;

  var accountCreationLoop = () =>
  {
    encrypter.getRandomPassword((clearPassword) =>
    {
      if(clearPassword == false)
      {
        console.log(`[${params.database.name}][${params.database.tables.accounts}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (encryption error) !`);

        Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
      }

      else
      {
        encrypter.encryptPassword(clearPassword, (encryptedPassword) =>
        {
          if(encryptedPassword == false)
          {
            console.log(`[${params.database.name}][${params.database.tables.accounts}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (encryption error) !`);
            
            Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
          }

          else
          {
            databaseManager.selectQuery(
            {
              'databaseName': params.database.name,
              'tableName': params.database.tables.accounts,
            
              'args':
              {
                '0': 'password'
              },
            
              'where':
              {
                '=':
                {
                  '0':
                  {
                    'key': 'email',
                    'value': accounts[Object.keys(accounts)[x]].email
                  }
                }
              }
            }, databaseConnector, (boolean, passwordOrErrorCode) =>
            {console.log(passwordOrErrorCode);
              if(boolean == false)
              {
                console.log(`[${params.database.name}][${params.database.tables.accounts}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (SQL error) !`);
                
                Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
              }

              else
              {
                if(passwordOrErrorCode.length > 0) encryptedPassword = passwordOrErrorCode[0].password;

                createOrUpdateAccount(passwordOrErrorCode.length > 0, accounts[Object.keys(accounts)[x]], encryptedPassword, databaseConnector, (boolean) =>
                {
                  if(boolean == false)
                  {
                    console.log(`[${params.database.name}][${params.database.tables.accounts}][ERROR] : could not create account "${accounts[Object.keys(accounts)[x]].email}" (SQL error) !`);
                    
                    Object.keys(accounts)[x += 1] == undefined ? callback() : accountCreationLoop();
                  }

                  else
                  {
                    passwordOrErrorCode.length == 0 ?
                    console.log(`[${params.database.name}][${params.database.tables.accounts}][SUCCESS] : account "${accounts[Object.keys(accounts)[x]].email}" created with password : "${clearPassword}" !`) :
                    console.log(`[${params.database.name}][${params.database.tables.accounts}][SUCCESS] : account "${accounts[Object.keys(accounts)[x]].email}" created with unchanged password !`);
                    
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

  if(Object.keys(accounts)[x] == undefined)
  {
    console.log(`[${params.database.name}][${params.database.tables.accounts}][INFO] : no accounts to create !`);
    callback();
  }
  
  else
  {
    accountCreationLoop();
  }
}

/****************************************************************************************************/

function createOrUpdateAccount(boolean, account, password, databaseConnector, callback)
{
  boolean ?

  databaseManager.updateQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,

    'args':
    {
      'email': account.email,
      'lastname': account.lastname,
      'firstname': account.firstname,
      'password': password,
      'suspended': account.suspended,
      'service': account.service,
      'is_admin': account.is_admin
    },

    'where':
    {
      '=':
      {
        '0':
        {
          'key': 'email',
          'value': account.email
        }
      }
    }
  }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
  {
    boolean == false ? callback(false) : callback(true);
  }) :

  databaseManager.insertQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,

    'uuid': true,

    'args':
    {
      'email': account.email,
      'lastname': account.lastname,
      'firstname': account.firstname,
      'password': password,
      'suspended': account.suspended,
      'service': account.service,
      'is_admin': account.is_admin
    }
  }, databaseConnector, (boolean, uuidOrErrorMessage) =>
  {
    boolean == false ? callback(false) : callback(true);
  });
}

/****************************************************************************************************/

module.exports.createRights = (databaseConnector, callback) =>
{
  var x = 0;

  var rightsCreationLoop = () =>
  {
    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.accounts,
  
      'args':
      {
        '0': 'uuid'
      },
  
      'where':
      {
        '=':
        {
          '0':
          {
            'key': 'email',
            'value': rights[Object.keys(rights)[x]].account
          }
        }
      }
    }, databaseConnector, (boolean, accountOrErrorMessage) =>
    {
      if(boolean == false)
      {
        console.log(`[${params.database.name}][${params.database.tables.rights}][ERROR] : could not create rights for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" (SQL error) !`);
        
        Object.keys(rights)[x += 1] == undefined ? callback() : rightsCreationLoop();
      }

      else
      {
        if(accountOrErrorMessage.length == 0)
        {
          console.log(`[${params.database.name}][${params.database.tables.rights}][ERROR] : could not create rights for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" (account not found) !`);
          
          Object.keys(rights)[x += 1] == undefined ? callback() : rightsCreationLoop();
        }

        else
        {
          var account = rights[Object.keys(rights)[x]].account;
          rights[Object.keys(rights)[x]].account = accountOrErrorMessage[0].uuid;
          
          databaseManager.selectQuery(
          {
            'databaseName': params.database.name,
            'tableName': params.database.tables.rights,
        
            'args':
            {
              '0': 'uuid'
            },
        
            'where':
            {
              'AND':
              {
                '=':
                {
                  '0':
                  {
                    'key': 'account',
                    'value': rights[Object.keys(rights)[x]].account
                  },
                  '1':
                  {
                    'key': 'service',
                    'value': rights[Object.keys(rights)[x]].service
                  }
                }
              }
            }
          }, databaseConnector, (boolean, rightsOrErrorMessage) =>
          {
            if(boolean == false)
            {
              console.log(`[${params.database.name}][${params.database.tables.rights}][ERROR] : could not create rights for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" (SQL error) !`);
              
              Object.keys(rights)[x += 1] == undefined ? callback() : rightsCreationLoop();
            }

            else
            {
              createOrUpdateRights(rightsOrErrorMessage.length > 0, rights[Object.keys(rights)[x]], databaseConnector, (boolean) =>
              {
                if(boolean == false)
                {
                  console.log(`[${params.database.name}][${params.database.tables.rights}][ERROR] : could not create rights for "${rights[Object.keys(rights)[x]].service}" for "${rights[Object.keys(rights)[x]].account}" (SQL error) !`);
                  
                  Object.keys(rights)[x += 1] == undefined ? callback() : rightsCreationLoop();
                }

                else
                {
                  console.log(`[${params.database.name}][${params.database.tables.rights}][SUCCESS] : rights created for "${rights[Object.keys(rights)[x]].service}" for "${account}" !`);
                  
                  Object.keys(rights)[x += 1] == undefined ? callback() : rightsCreationLoop();
                }
              });
            }
          });
        }
      }
    });
  }

  if(Object.keys(rights)[x] == undefined)
  {
    console.log(`[${params.database.name}][${params.database.tables.rights}][INFO] : no rights to create !`);
    callback();
  }

  else
  {
    rightsCreationLoop();
  }
}

/****************************************************************************************************/

function createOrUpdateRights(boolean, rights, databaseConnector, callback)
{
  boolean ?

  databaseManager.updateQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.rights,

    'args':
    {
      'account': rights.account,
      'service': rights.service,
      'upload_files': rights.upload_files,
      'download_files': rights.download_files,
      'remove_files': rights.remove_files,
      'post_comments': rights.post_comments,
    },

    'where':
    {
      'AND':
      {
        '=':
        {
          '0':
          {
            'key': 'account',
            'value': rights.account
          },
          '1':
          {
            'key': 'service',
            'value': rights.service
          }
        }
      }
    }
  }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
  {
    boolean == false ? callback(false) : callback(true);
  }) :

  databaseManager.insertQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.rights,

    'uuid': true,

    'args':
    {
      'account': rights.account,
      'service': rights.service,
      'upload_files': rights.upload_files,
      'download_files': rights.download_files,
      'remove_files': rights.remove_files,
      'post_comments': rights.post_comments,
    }
  }, databaseConnector, (boolean, uuidOrErrorMessage) =>
  {
    boolean == false ? callback(false) : callback(true);
  });
}

/****************************************************************************************************/