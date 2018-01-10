'use strict';

var params                = require(`${__root}/json/config`);
var constants             = require(`${__root}/functions/constants`);
var encryption            = require(`${__root}/functions/encryption`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.resetPassword = (emailAddress, databaseConnector, emailTransporter, callback) =>
{
  databaseManager.selectQuery(
  {
    'databaseName': params.database.name,
    'tableName': params.database.tables.accounts,

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
    if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

    else
    {
      accountOrErrorMessage.length == 0 ? callback(false, 404, constants.ACCOUNT_NOT_FOUND) :

      encryption.getRandomPassword((clearPassword, encryptedPassword) =>
      {
        if(clearPassword == false) callback(false, 500, constants.ENCRYPTION_FAILED);

        else
        {
          databaseManager.updateQuery(
          {
            'databaseName': params.database.name,
            'tableName': params.database.tables.accounts,

            'args': 
            { 
              'password': encryptedPassword 
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
            if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

            else
            {
              var mailOptions = 
              {
                from: 'Library PEI <noreply@groupepei.fr>',
                to: emailAddress,
                subject: 'Nouveau mot de passe',
                html: `<p>Voici votre nouveau mot de passe : <span>${clearPassword}</span></p>`
              };

              emailTransporter.sendMail(mailOptions, (err, info) => 
              {
                if(err) callback(false, 500, constants.MAIL_NOT_SENT);

                else
                {
                  callback(true);
                }
              });
            }
          });
        }
      });
    }
  });
}

/****************************************************************************************************/