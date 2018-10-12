'use strict'

const constants           = require(`${__root}/functions/constants`);
const encryption          = require(`${__root}/functions/encryption`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonEmailSend     = require(`${__root}/functions/common/email/send`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.updateEmailAddress = (newEmailAddress, accountUuid, databaseConnection, params, callback) =>
{
  if(new RegExp('^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$').test(newEmailAddress) == false) return callback({ status: 406, code: constants.WRONG_EMAIL_FORMAT, detail: null });

  var updateEmailAddressQuery = () =>
  {
    databaseManager.updateQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.accounts,
      args: { email: newEmailAddress },
      where: { operator: '=', key: 'uuid', value: accountUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null);
    });
  }

  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    const currentAccountData = accountData;

    commonAccountsGet.checkIfAccountExistsFromEmail(newEmailAddress, databaseConnection, params, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      if(accountExists == false) updateEmailAddressQuery();

      else
      {
        const foundAccountData = accountData;

        if(foundAccountData.uuid === accountUuid) return callback({ status: 406, code: constants.SAME_EMAIL_ADDRESS, detail: null });

        return callback({ status: 406, code: constants.EMAIL_ALREADY_IN_USE, detail: null });
      }      
    });
  });
}

/****************************************************************************************************/

module.exports.updateLastname = (newLastname, accountUuid, databaseConnection, params, callback) =>
{
  if(new RegExp('^[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+(-)?[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+$').test(newLastname) == false) return callback({ status: 406, code: constants.WRONG_LASTNAME_FORMAT, detail: null });

  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    databaseManager.updateQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.accounts,
      args: { lastname: newLastname },
      where: { operator: '=', key: 'uuid', value: accountUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null);
    });    
  });
}

/****************************************************************************************************/

module.exports.updateFirstname = (newFirstname, accountUuid, databaseConnection, params, callback) =>
{
  if(new RegExp('^[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+(-)?[a-zA-ZÈÉÊËÎÏèéêëîïâäÂÄ]+$').test(newFirstname) == false) return callback({ status: 406, code: constants.WRONG_FIRSTNAME_FORMAT, detail: null });

  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    databaseManager.updateQuery(
    {
      databaseName: params.database.root.label,
      tableName: params.database.root.tables.accounts,
      args: { firstname: newFirstname },
      where: { operator: '=', key: 'uuid', value: accountUuid }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

      return callback(null);
    });    
  });
}

/****************************************************************************************************/

module.exports.updatePassword = (currentPassword, newPassword, confirmationPassword, accountUuid, databaseConnection, params, callback) =>
{
  if(currentPassword.length === 0) return callback({ status: 406, code: constants.INCORRECT_CURRENT_PASSWORD, detail: null });

  if(new RegExp('^[a-zA-Z0-9]{8,64}$').test(newPassword) == false) return callback({ status: 406, code: constants.INCORRECT_PASSWORD_FORMAT, detail: null });

  if(newPassword !== confirmationPassword) return callback({ status: 406, code: constants.NEW_PASSWORD_AND_CONFIRMATION_MISMATCH, detail: null });

  commonAccountsGet.checkIfAccountExistsFromUuid(accountUuid, databaseConnection, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    encryption.encryptPassword(currentPassword, (error, encryptedCurrentPassword) =>
    {
      if(error != null) return callback(error);

      if(accountData.password !== encryptedCurrentPassword) return callback({ status: 406, code: constants.INCORRECT_CURRENT_PASSWORD, detail: null });

      encryption.encryptPassword(newPassword, (error, encryptedNewPassword) =>
      {
        if(error != null) return callback(error);

        databaseManager.updateQuery(
        {
          databaseName: params.database.root.label,
          tableName: params.database.root.tables.accounts,
          args: { password: encryptedNewPassword },
          where: { operator: '=', key: 'uuid', value: accountUuid }

        }, databaseConnection, (error, result) =>
        {
          if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });

          return callback(null);
        });
      });
    });
  });
}

/****************************************************************************************************/