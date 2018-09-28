'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonEmailSend       = require(`${__root}/functions/common/email/send`);
const commonFormatName      = require(`${__root}/functions/common/format/name`);
const commonFormatEmail     = require(`${__root}/functions/common/format/email`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);
const commonRightsCreate    = require(`${__root}/functions/common/rights/create`);

const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

var accountsCreate = module.exports = {};

/****************************************************************************************************/

accountsCreate.createAccount = (account, databaseConnection, transporter, callback) =>
{
  if(account.email == undefined)      return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'email' });
  if(account.lastname == undefined)   return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'lastname' });
  if(account.firstname == undefined)  return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'firstname' });

  commonAccountsGet.checkIfAccountExistsFromEmail(account.email, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists) return callback({ status: 406, code: constants.EMAIL_ALREADY_IN_USE, target: 'email' });

    checkEmailFormat(account, databaseConnection, transporter, (error) =>
    {
      return callback(error);
    });
  });
}

/****************************************************************************************************/

function checkEmailFormat(account, databaseConnection, transporter, callback)
{
  commonFormatEmail.checkEmailAddressFormat(account.email, (error, isValid) =>
  {
    if(error != null) return callback(error);

    if(isValid == false) return callback({ status: 406, code: constants.WRONG_EMAIL_FORMAT, target: 'email' });

    checkLastnameFormat(account, databaseConnection, transporter, callback);
  });
}

/****************************************************************************************************/

function checkLastnameFormat(account, databaseConnection, transporter, callback)
{
  commonFormatName.checkNameFormat(account.lastname, (error, isValid) =>
  {
    if(error != null) return callback(error);

    if(isValid == false) return callback({ status: 406, code: constants.WRONG_LASTNAME_FORMAT, target: 'lastname' });

    checkFirstnameFormat(account, databaseConnection, transporter, callback);
  });
}

/****************************************************************************************************/

function checkFirstnameFormat(account, databaseConnection, transporter, callback)
{
  commonFormatName.checkNameFormat(account.firstname, (error, isValid) =>
  {
    if(error != null) return callback(error);

    if(isValid == false) return callback({ status: 406, code: constants.WRONG_LASTNAME_FORMAT, target: 'firstname' });

    getPasswordsAndInsertAccountInDatabase(account, databaseConnection, transporter, callback);
  });
}

/****************************************************************************************************/

function getPasswordsAndInsertAccountInDatabase(account, databaseConnection, transporter, callback)
{
  encryption.getRandomPassword((error, passwords) =>
  {
    if(error != null) return callback(error);

    databaseManager.insertQueryWithUUID(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.accounts,
      args: { email: account.email, lastname: account.lastname, firstname: account.firstname, password: passwords.encrypted, suspended: 0 }

    }, databaseConnection, (error, result, accountUuid) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      account.uuid = accountUuid;

      createRightsOnIntranet(account, databaseConnection, transporter, callback);
    });
  });
}

/****************************************************************************************************/

function createRightsOnIntranet(account, databaseConnection, transporter, callback)
{
  commonRightsCreate.createRightsForAccountOnIntranet(account.uuid, databaseConnection, params, (error) =>
  {
    if(error != null) return callback(error);

    sendEmailWithPassword(account, databaseConnection, transporter, callback);
  });
}

/****************************************************************************************************/

function sendEmailWithPassword(account, databaseConnection, transporter, callback)
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

/****************************************************************************************************/