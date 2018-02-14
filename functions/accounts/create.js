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
  accountsCheck.checkAccountFormat(obj, databaseConnector, (error) =>
  {
    if(error != null) callback(error);

    else
    {
      if(obj.service == undefined || !(obj.service in services)) callback({ status: 406, code: constants.SERVICE_NOT_FOUND });

      else
      {
        if(obj.admin == undefined || (obj.admin != '0' && obj.admin != '1')) callback({ status: 406, code: constants.ADMIN_STATUS_IS_MISSING });

        else
        {
          encryption.getRandomPassword((error, passwords) =>
          {
            error != null ? callback(error) :

            databaseManager.insertQuery(
            {
              'databaseName': config.database.name,
              'tableName': config.database.tables.accounts,

              'uuid': true,
      
              'args':
              {
                'email': obj.email.replace(/"/g, ''),
                'lastname': obj.lastname.replace(/"/g, ''),
                'firstname': obj.firstname.replace(/"/g, ''),
                'password': passwords.encrypted,
                'suspended': 0,
                'service': obj.service.replace(/"/g, ''),
                'is_admin': obj.admin
              }
            }, databaseConnector, (boolean, insertedIdOrErrorMessage) =>
            {
              if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR });
              
              else
              {
                if(params.init.servicesStarted.transporter == false)
                {
                  console.log(`Transporter service is not started !\nPassword for "${obj.email}" is "${passwords.clear}" !`);
                  callback({ status: 400, code: constants.ACCOUNT_CREATED_WITHOUT_SENDING_EMAIL });
                }

                else
                {
                  accountEmail.accountCreated(obj.email, passwords.clear, emailTransporter, (error) =>
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