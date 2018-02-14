'use strict';

const config                = require(`${__root}/json/config`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountEmail          = require(`${__root}/functions/email/account`);
const databaseManager       = require(`${__root}/functions/database/${config.database.dbms}`);

/****************************************************************************************************/

module.exports.resetPassword = (emailAddress, databaseConnector, emailTransporter, params, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': config.database.name,
    'tableName': config.database.tables.accounts,

    'args': { '0': 'id' },

    'where':
    {
      '=':
      {
        '0':
        {
          'key': 'email',
          'value': emailAddress
        }
      }
    }
  }, databaseConnector, (boolean, accountOrErrorMessage) =>
  {
    if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

    else
    {
      accountOrErrorMessage.length == 0 ? callback({ status: 500, code: constants.ACCOUNT_NOT_FOUND }) :

      encryption.getRandomPassword((error, passwords) =>
      {
        if(error != null) callback(error);

        else
        {
          databaseManager.updateQuery(
          {
            'databaseName': config.database.name,
            'tableName': config.database.tables.accounts,

            'args': 
            { 
              'password': passwords.encrypted 
            },

            'where':
            {
              '=':
              {
                '0':
                {
                  'key': 'email',
                  'value': emailAddress
                }
              }
            }
          }, databaseConnector, (boolean, updatedRowsOrErrorMessage) =>
          {
            if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });

            else
            {
              if(params.init.servicesStarted.transporter == false)
              {
                console.log(`Transporter service is not started !\nPassword for "${emailAddress}" is "${passwords.clear}" !`);
                callback({ status: 400, code: constants.PASSWORD_RESETED_WITHOUT_SENDING_EMAIL });
              }

              else
              {
                accountEmail.forgottenPassword(emailAddress, passwords.clear, emailTransporter, (error) =>
                {
                  callback(error);
                });
              }
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/