'use strict';

var params                = require(`${__root}/json/config`);
var services              = require(`${__root}/json/services`);
var constants             = require(`${__root}/functions/constants`);
var encryption            = require(`${__root}/functions/encryption`);
var accountsCheck         = require(`${__root}/functions/accounts/check`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.createAccount = (obj, databaseConnector, emailTransporter, callback) =>
{
  accountsCheck.checkAccountFormat(obj, databaseConnector, (boolean, errorStatus, errorCode) =>
  {
    if(boolean == false) callback(false, errorStatus, errorCode);

    else
    {
      if(obj.service == undefined || !(obj.service in services)) callback(false, 406, constants.SERVICE_NOT_FOUND);

      else
      {
        if(obj.admin == undefined || (obj.admin != '0' && obj.admin != '1')) callback(false, 406, constants.ADMIN_STATUS_IS_MISSING);

        else
        {
          encryption.getRandomPassword((uncryptedPassword, encryptedPasswordOrErrorStatus, errorCode) =>
          {
            uncryptedPassword == false ? callback(false, 500, constants.ENCRYPTION_FAILED) :

            databaseManager.insertQuery(
            {
              'databaseName': params.database.name,
              'tableName': params.database.tables.accounts,

              'uuid': true,
      
              'args':
              {
                'email': obj.email,
                'lastname': obj.lastname,
                'firstname': obj.firstname,
                'password': encryptedPasswordOrErrorStatus,
                'activated': 1,
                'suspended': 0,
                'service': obj.service,
                'is_admin': obj.admin
              }
            }, databaseConnector, (boolean, insertedIdOrErrorMessage) =>
            {
              if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
              
              else
              {
                var mailOptions = 
                {
                  from: 'Library PEI <noreply@groupepei.fr>',
                  to: obj.email,
                  subject: 'Mot de passe',
                  html: `<p>Voici votre mot de passe : <span>${uncryptedPassword}</span></p>`
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
          });
        }
      }
    }
  });
}

/****************************************************************************************************/