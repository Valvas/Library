'use strict';

const config                = require(`${__root}/json/config`);
const services              = require(`${__root}/json/services`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountEmail          = require(`${__root}/functions/email/account`);
const accountsCheck         = require(`${__root}/functions/accounts/check`);
const databaseManager       = require(`${__root}/functions/database/${config.database.dbms}`);

/****************************************************************************************************/

module.exports.createAccount = (obj, databaseConnector, emailTransporter, params, callback) =>
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
              'databaseName': config.database.name,
              'tableName': config.database.tables.accounts,

              'uuid': true,
      
              'args':
              {
                'email': obj.email,
                'lastname': obj.lastname,
                'firstname': obj.firstname,
                'password': encryptedPasswordOrErrorStatus,
                'suspended': 0,
                'service': obj.service,
                'is_admin': obj.admin
              }
            }, databaseConnector, (boolean, insertedIdOrErrorMessage) =>
            {
              if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);
              
              else
              {
                if(params.init.servicesStarted.transporter == false)
                {
                  console.log(`Transporter service is not started !\nPassword for "${obj.email}" is "${uncryptedPassword}" !`);
                  callback({ status: 400, code: constants.ACCOUNT_CREATED_WITHOUT_SENDING_EMAIL });
                }

                else
                {
                  accountEmail.accountCreated(obj.email, uncryptedPassword, emailTransporter, (error) =>
                  {
                    callback(error);
                  });
                }
              }
            });
          });
        }
      }
    }
  });
}

/****************************************************************************************************/