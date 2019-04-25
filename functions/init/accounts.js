'use strict'

const accountsToCreate      = require(`${__root}/json/accounts`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);
const commonAccountsCreate  = require(`${__root}/functions/common/accounts/create`);
const commonAccountsUpdate  = require(`${__root}/functions/common/accounts/update`);

/****************************************************************************************************/

module.exports.createAdminAccounts = (databaseConnection, globalParameters, emailTransporter, callback) =>
{
  let index = 0;

  const browseAccountsToCreate = () =>
  {
    createAdminAccountsCheckIfExists(accountsToCreate[index], databaseConnection, globalParameters, emailTransporter, (error) =>
    {
      if(error !== null)
      {
        return callback(error);
      }

      if(accountsToCreate[index += 1] === undefined)
      {
        return callback(null);
      }

      browseAccountsToCreate();
    });
  }

  if(accountsToCreate[index] === undefined)
  {
    return callback(null);
  }

  browseAccountsToCreate();
}

/****************************************************************************************************/

function createAdminAccountsCheckIfExists(accountData, databaseConnection, globalParameters, emailTransporter, callback)
{
  commonAccountsGet.checkIfAccountExistsFromEmail(accountData.email, databaseConnection, globalParameters, (error, accountExists, existingAccountData) =>
  {
    if(error !== null)
    {
      return callback(error);
    }

    if(accountExists)
    {
      return createAdminAccountsUpdateAdminStatus(existingAccountData.uuid, databaseConnection, globalParameters, callback);
    }

    return createAdminAccountsInsertIntoDatabase(accountData, databaseConnection, globalParameters, emailTransporter, callback);
  });
}

/****************************************************************************************************/

function createAdminAccountsInsertIntoDatabase(accountData, databaseConnection, globalParameters, emailTransporter, callback)
{
  commonAccountsCreate.createAccount(accountData.email, accountData.lastname, accountData.firstname, databaseConnection, globalParameters, emailTransporter, (error, accountUuid) =>
  {
    if(error !== null)
    {
      return callback(null);
    }

    return createAdminAccountsUpdateAdminStatus(accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createAdminAccountsUpdateAdminStatus(accountUuid, databaseConnection, globalParameters, callback)
{
  commonAccountsUpdate.updateAdminStatus(accountUuid, true, databaseConnection, globalParameters, (error) =>
  {
    return callback(error);
  });
}

/****************************************************************************************************/
