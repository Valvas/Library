'use strict';

var params                     = require(`${__root}/json/config`);
var services                   = require(`${__root}/json/services`);
var format                     = require(`${__root}/functions/format`);
var constants                  = require(`${__root}/functions/constants`);
var databaseManager            = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.getAccountList = (databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,

    'args':
    {
      '0': '*'
    },

    'where':
    {

    }
  }, databaseConnector, (boolean, accountsOrErrorCode) =>
  {
    boolean ? callback(accountsOrErrorCode) : callback(false, 500, constants.SQL_SERVER_ERROR);
  });
};

/****************************************************************************************************/

module.exports.getAccountFromUUID = (accountUUID, databaseConnector, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
  
    'args':
    {
      '0': '*'
    },
  
    'where':
    {
      '=':
      {
        '0':
        {
          'key': 'uuid',
          'value': accountUUID
        }
      }
    }
  }, databaseConnector, (boolean, accountOrErrorCode) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      accountOrErrorCode.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) : callback(accountOrErrorCode[0]);
    }
  });
}

/****************************************************************************************************/

module.exports.updateEmail = (accountUUID, emailAddress, databaseConnector, callback) =>
{
  accountUUID         == undefined      ||
  emailAddress        == undefined      ||
  databaseConnector   == undefined      ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  format.checkEmailFormat(emailAddress, (boolean) =>
  {
    boolean == false ? callback(false, 500, constants.WRONG_EMAIL_FORMAT) :

    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.accounts,
      'args': { '0': 'id' },
      'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }

    }, databaseConnector, (boolean, currentAccountOrErrorMessage) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

      else
      {
        currentAccountOrErrorMessage.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) :

        databaseManager.selectQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,
          'args': { '0': 'id' },
          'where': { '=': { '0': { 'key': 'email', 'value': emailAddress } } }

        }, databaseConnector, (boolean, duplicateAccountOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

          else
          {
            duplicateAccountOrErrorMessage.length > 0 ? callback(false, 406, constants.EMAIL_ALREADY_IN_USE) :

            databaseManager.updateQuery(
            {
              'databaseName': params.database.name,
              'tableName': params.database.tables.accounts,
              'args': { 'email': emailAddress },
              'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }
    
              }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
              {
                if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
    
                else
                {
                  updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.ACCOUNT_NOT_UPDATED) : callback(true);
                }
              });
          }
        });
      }
    });
  });
}

/****************************************************************************************************/

module.exports.updateLastname = (accountUUID, lastname, databaseConnector, callback) =>
{
  accountUUID         == undefined      ||
  lastname            == undefined      ||
  databaseConnector   == undefined      ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  format.checkStrFormat(lastname, params.format.account.lastname, (boolean) =>
  {
    boolean == false ? callback(false, 500, constants.WRONG_LASTNAME_FORMAT) :

    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.accounts,
      'args': { '0': 'id' },
      'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }

    }, databaseConnector, (boolean, accountOrErrorMessage) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
    
      else
      {
        accountOrErrorMessage.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) :

        databaseManager.updateQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,
          'args': { 'lastname': `${lastname.charAt(0).toUpperCase()}${lastname.slice(1).toLowerCase()}` },
          'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }

        }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

          else
          {
            updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.ACCOUNT_NOT_UPDATED) : callback(true);
          }
        });
      }
    });
  });
}

/****************************************************************************************************/

module.exports.updateFirstname = (accountUUID, firstname, databaseConnector, callback) =>
{
  accountUUID         == undefined      ||
  firstname           == undefined      ||
  databaseConnector   == undefined      ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  format.checkStrFormat(firstname, params.format.account.firstname, (boolean) =>
  {
    boolean == false ? callback(false, 500, constants.WRONG_FIRSTNAME_FORMAT) :

    databaseManager.selectQuery(
    {
      'databaseName': params.database.name,
      'tableName': params.database.tables.accounts,
      'args': { '0': 'id' },
      'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }
      
    }, databaseConnector, (boolean, accountOrErrorMessage) =>
    {
      if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
    
      else
      {
        accountOrErrorMessage.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) :

        databaseManager.updateQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,
          'args': { 'firstname': `${firstname.charAt(0).toUpperCase()}${firstname.slice(1).toLowerCase()}` },
          'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }

        }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

          else
          {
            updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.ACCOUNT_NOT_UPDATED) : callback(true);
          }
        });
      }
    });
  });
}

/****************************************************************************************************/

module.exports.updateService = (accountUUID, service, databaseConnector, callback) =>
{
  accountUUID         == undefined      ||
  service             == undefined      ||
  databaseConnector   == undefined      ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
    'args': { '0': 'id' },
    'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }
      
  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
    
    else
    {
      if(accountOrErrorMessage.length == 0) callback(false, 404, constants.ACCOUNT_NOT_FOUND);

      else
      {
        !(service in services) ? callback(false, 406, constants.SERVICE_NOT_FOUND) :

        databaseManager.updateQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,
          'args': { 'service': service },
          'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }

        }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

          else
          {
            updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.ACCOUNT_NOT_UPDATED) : callback(true);
          }
        });
      }
    }
  });
}

/****************************************************************************************************/

module.exports.updateAdminStatus = (accountUUID, adminStatus, databaseConnector, callback) =>
{
  accountUUID         == undefined      ||
  adminStatus         == undefined      ||
  databaseConnector   == undefined      ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
    'args': { '0': 'id' },
    'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }
        
  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
      
    else
    {
      if(accountOrErrorMessage.length == 0) callback(false, 404, constants.ACCOUNT_NOT_FOUND);
  
      else
      {
        adminStatus != 0 && adminStatus != 1 ? callback(false, 406, constants.INCORRECT_ADMIN_STATUS) :
  
        databaseManager.updateQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,
          'args': { 'is_admin': adminStatus },
          'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }
  
        }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
  
          else
          {
            updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.ACCOUNT_NOT_UPDATED) : callback(true);
          }
        });
      }
    }
  });
}

/****************************************************************************************************/

module.exports.updateSuspendedStatus = (accountUUID, suspendStatus, databaseConnector, callback) =>
{
  accountUUID         == undefined      ||
  suspendStatus       == undefined      ||
  databaseConnector   == undefined      ?

  callback(false, 406, constants.MISSING_DATA_IN_REQUEST) :

  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,
    'args': { '0': 'id' },
    'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }
        
  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
      
    else
    {
      if(accountOrErrorMessage.length == 0) callback(false, 404, constants.ACCOUNT_NOT_FOUND);
  
      else
      {
        suspendStatus != 0 && suspendStatus != 1 ? callback(false, 406, constants.INCORRECT_SUSPENSION_STATUS) :
  
        databaseManager.updateQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,
          'args': { 'suspended': suspendStatus },
          'where': { '=': { '0': { 'key': 'uuid', 'value': accountUUID } } }
  
        }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
  
          else
          {
            updatedRowsOrErrorMessage == 0 ? callback(false, 500, constants.ACCOUNT_NOT_UPDATED) : callback(true);
          }
        });
      }
    }
  });
}

/****************************************************************************************************/