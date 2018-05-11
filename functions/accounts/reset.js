'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonEmailSend       = require(`${__root}/functions/common/email/send`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.resetPassword = (emailAddress, databaseConnector, emailTransporter, params, callback) =>
{
  accountsGet.getAccountUsingEmail(emailAddress, databaseConnector, (error, account) =>
  {
    if(error != null) return callback(error);

    encryption.getRandomPassword((error, passwords) =>
    {
      if(error != null) return callback(error);

      databaseManager.updateQuery(
      {
        'databaseName': params.database.root.label,
        'tableName': params.database.root.tables.accounts,
        'args': { 'password': passwords.encrypted },
        'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': account.id } } }

      }, databaseConnector, (boolean, errorMessage) =>
      {
        if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: errorMessage });

        var emailObject = {};

        emailObject.object = 'Nouveau mot de passe';
        emailObject.receiver = emailAddress;

        emailObject.content = '<body style="font-family:-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, Cantarell, \'Open Sans\', \'Helvetica Neue\', sans-serif;">';
        emailObject.content += '<h3>MOT DE PASSE</h3>'
        emailObject.content += '</br><div>Veuillez trouver ci-dessous votre nouveau mot de passe afin de vous connecter au portail des applications PEI : </div>';
        emailObject.content += '</br><div style="font-size:1.25em; font-weight:bold; margin:10px 0 10px 0;">' + passwords.clear + '</div></br></br>';
        emailObject.content += '<div style="margin-top:20px; font-size:0.75em; font-style:italic;">Ne répondez pas à cet email.</div>'
        emailObject.content += '</body>';
        
        commonEmailSend.sendEmail(emailObject, emailTransporter, (error) =>
        {
          if(error != null) return callback(error);

          return callback(null);
        });
      });
    });
  });
}

/****************************************************************************************************/