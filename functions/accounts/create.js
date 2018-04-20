'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonEmailSend       = require(`${__root}/functions/common/email/send`);
const commonFormatName      = require(`${__root}/functions/common/format/name`);
const commonAppsAccess      = require(`${__root}/functions/common/apps/access`);
const commonFormatEmail     = require(`${__root}/functions/common/format/email`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

var accountsCreate = module.exports = {};

/****************************************************************************************************/

accountsCreate.createAccount = (account, databaseConnector, transporter, callback) =>
{
  account.email         == undefined ||
  account.lastname      == undefined ||
  account.firstname     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingEmail(account.email, databaseConnector, (error, resultAccount) =>
  {
    if(resultAccount != undefined) return callback({ status: 406, code: constants.EMAIL_ALREADY_IN_USE, target: 'email' });

    else if(error != null && error.status != 404) return callback(error);

    commonFormatEmail.checkEmailAddressFormat(account.email, (error, boolean) =>
    {
      if(error != null) return callback(error);

      if(boolean == false) return callback({ status: 406, code: constants.WRONG_EMAIL_FORMAT, target: 'email' });

      commonFormatName.checkNameFormat(account.lastname, (error, boolean) =>
      {
        if(error != null) return callback(error);

        if(boolean == false) return callback({ status: 406, code: constants.WRONG_LASTNAME_FORMAT, target: 'lastname' });

        commonFormatName.checkNameFormat(account.firstname, (error, boolean) =>
        {
          if(error != null) return callback(error);

          if(boolean == false) return callback({ status: 406, code: constants.WRONG_FIRSTNAME_FORMAT, target: 'firstname' });

          encryption.getRandomPassword((error, passwords) =>
          {
            if(error != null) return callback(error);

            databaseManager.insertQuery(
            {
              'databaseName': params.database.root.label,
              'tableName': params.database.root.tables.accounts,
              'uuid': true,
              'args': { 'email': account.email, 'lastname': account.lastname, 'firstname': account.firstname, 'password': passwords.encrypted, 'suspended': 0 }

            }, databaseConnector, (boolean, accountIDOrErrorMessage) =>
            {
              if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR });

              accountsCreate.createAccess(accountIDOrErrorMessage, databaseConnector, (error) =>
              {
                if(error != null)
                {
                  databaseManager.deleteQuery(
                  {
                    'databaseName': params.database.root.label,
                    'tableName': params.database.root.tables.accounts,
                    'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': accountIDOrErrorMessage } } }
                    
                  }, databaseConnector, (boolean, deletedRowsOrErrorMessage) =>
                  {
                    if(boolean == false) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: deletedRowsOrErrorMessage });

                    return callback(error);
                  });
                }

                else
                {
                  commonEmailSend.sendEmail(
                  {
                    receiver: account.email,
                    object: 'Votre mot de passe pour le portail des applications PEI',
                    content: `<h1>BONJOUR</h1><div>Un compte vient d'être créé pour vous sur le portail des applications PEI.</div><div>Pour vous connecter il faut utiliser cette adresse email et le mot de passe suivant :</div><div style='font-weight:bold; margin:10px;'>${passwords.clear}</div>`

                  }, transporter, (error) =>
                  {
                    if(error != null) return callback(error);

                    return callback(null, constants.ACCOUNT_SUCCESSFULLY_CREATED);
                  });
                }
              });
            });
          });
        });
      });
    });
  });
}

/****************************************************************************************************/

accountsCreate.createAccess = (accountID, databaseConnector, callback) =>
{
  accountID == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  commonAppsAccess.getAppsAvailableForAccount(accountID, databaseConnector, (error, access) =>
  {
    if(access != undefined) callback(null);

    else if(error != null && error.status != 404) callback(error);

    else
    {
      databaseManager.insertQuery(
      {
        'databaseName': params.database.root.label,
        'tableName': params.database.root.tables.access,
        'uuid': false,
        'args': { 'account': accountID, 'storage': 0, 'disease': 0, 'admin': 0 }

      }, databaseConnector, (boolean, insertedIDOrErrorMessage) =>
      {
        if(boolean == false) callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: insertedIDOrErrorMessage });

        else
        {
          callback(null);
        }
      });
    }
  });
}

/****************************************************************************************************/