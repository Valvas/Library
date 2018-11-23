'use strict'

const uuid                = require('uuid');
const commonStrings       = require(`${__root}/json/strings/common`);
const constants           = require(`${__root}/functions/constants`);
const encryption          = require(`${__root}/functions/encryption`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonEmailSend     = require(`${__root}/functions/common/email/send`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.createAccount = (accountEmail, accountLastname, accountFirstname, databaseConnection, globalParameters, mailTransporter, callback) =>
{
  if(new RegExp('^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$').test(accountEmail) == false)
  {
    return callback({ status: 406, code: constants.WRONG_EMAIL_FORMAT, detail: null });
  }
  
  if(new RegExp('^[a-zéàèâêîôûäëïöüñ]+(-)?[a-zéàèâêîôûäëïöüñ]+$').test(accountLastname) == false)
  {
    return callback({ status: 406, code: constants.WRONG_LASTNAME_FORMAT, detail: null });
  }

  if(new RegExp('^[a-zéàèâêîôûäëïöüñ]+(-)?[a-zéàèâêîôûäëïöüñ]+$').test(accountFirstname) == false)
  {
    return callback({ status: 406, code: constants.WRONG_FIRSTNAME_FORMAT, detail: null });
  }

  createAccountCheckIfEmailAddressIsAvailable(accountEmail, accountLastname, accountFirstname, databaseConnection, globalParameters, mailTransporter, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/

function createAccountCheckIfEmailAddressIsAvailable(accountEmail, accountLastname, accountFirstname, databaseConnection, globalParameters, mailTransporter, callback)
{
  commonAccountsGet.checkIfAccountExistsFromEmail(accountEmail, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists) return callback({ status: 406, code: constants.EMAIL_ALREADY_IN_USE, detail: null });

    return createAccountGetClearAndEncryptedPassword(accountEmail, accountLastname, accountFirstname, databaseConnection, globalParameters, mailTransporter, callback);
  });
}

/****************************************************************************************************/

function createAccountGetClearAndEncryptedPassword(accountEmail, accountLastname, accountFirstname, databaseConnection, globalParameters, mailTransporter, callback)
{
  encryption.getRandomPassword(globalParameters, (error, passwords) =>
  {
    if(error != null) return callback(error);

    return createAccountInsertInDatabase(accountEmail, accountLastname, accountFirstname, passwords.clear, passwords.encrypted, databaseConnection, globalParameters, mailTransporter, callback);
  });
}

/****************************************************************************************************/

function createAccountInsertInDatabase(accountEmail, accountLastname, accountFirstname, clearPassword, encryptedPassword, databaseConnection, globalParameters, mailTransporter, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.accounts,
    args: { uuid: generatedUuid, email: accountEmail, lastname: accountLastname, firstname: accountFirstname, password: encryptedPassword, suspended: 0, is_admin: 0 }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return createAccountAddRightsInDatabase(generatedUuid, accountEmail, clearPassword, databaseConnection, globalParameters, mailTransporter, callback);
  });
}

/****************************************************************************************************/

function createAccountAddRightsInDatabase(accountUuid, accountEmail, clearPassword, databaseConnection, globalParameters, mailTransporter, callback)
{
  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.root.label,
    tableName: globalParameters.database.root.tables.rights,
    args: { account: accountUuid, create_articles: 0, update_articles: 0, update_own_articles: 0, remove_articles: 0, remove_own_articles: 0 }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return createAccountSendPassword(accountEmail, clearPassword, globalParameters, mailTransporter, callback);
  });
}

/****************************************************************************************************/

function createAccountSendPassword(accountEmail, clearPassword, globalParameters, mailTransporter, callback)
{
  var emailContent = commonStrings.emailTemplates.createAccountSendPassword.content;

  emailContent = emailContent.replace('[$emailAddress$]', accountEmail);
  emailContent = emailContent.replace('[$clearPassword$]', clearPassword);

  var emailObject =
  {
    receiver: accountEmail,
    object: commonStrings.emailTemplates.createAccountSendPassword.object,
    content: emailContent
  }

  commonEmailSend.sendEmail(emailObject, mailTransporter, globalParameters, (error) =>
  {
    return callback({ status: 500, code: constants.ACCOUNT_CREATED_WITHOUT_SENDING_PASSWORD_EMAIL, detail: null });
  });
}

/****************************************************************************************************/