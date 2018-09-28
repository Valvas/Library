'use strict'

const params                = require(`${__root}/json/params`);
const errors                = require(`${__root}/json/errors`);
const accounts              = require(`${__root}/json/accounts`);
const constants             = require(`${__root}/functions/constants`);
const accountsCheck         = require(`${__root}/functions/accounts/check`);
const accountsCreate        = require(`${__root}/functions/accounts/create`);
const accountsUpdate        = require(`${__root}/functions/accounts/update`);

const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/

module.exports.createAccounts = (databaseConnection, transporter, callback) =>
{
  if(databaseConnection == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: null });

  var x = 0;

  var accountCreationLoop = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromEmail(accounts[x].email, databaseConnection, params, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      accountsCheck.checkAccountFormat({ email: accounts[x].email, lastname: accounts[x].lastname, firstname: accounts[x].firstname, suspended: accounts[x].suspended }, (error, correctedAccount) =>
      {
        if(error != null) return callback(error);

        if(accountExists)
        {
          accountsUpdate.updateAccount(
          {
            uuid: accountData.uuid,
            email: accountData.email,
            lastname: correctedAccount.lastname,
            firstname: correctedAccount.firstname,
            password: accountData.password,
            suspended: correctedAccount.suspended

          }, databaseConnection, (error) =>
          {
            error != null
            ? console.log(`[ACCOUNTS] - Error - could not create account "${accounts[x].email}" (${errors[error.code]})`)
            : console.log(`[ACCOUNTS] - Update - account "${accounts[x].email}" successfully updated`);

            accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
          });
        }

        else
        {
          accountsCreate.createAccount(
          {
            email: accounts[x].email,
            lastname: correctedAccount.lastname,
            firstname: correctedAccount.firstname,
            suspended: correctedAccount.suspended

          }, databaseConnection, transporter, (error) =>
          {
            if(error == null) console.log(`[ACCOUNTS] - Creation - account "${accounts[x].email}" successfully created`);

            else
            {
              error.code === constants.MAIL_NOT_SENT
              ? console.log(`[ACCOUNTS] - Creation - account "${accounts[x].email}" created but email with password not sent`)
              : console.log(`[ACCOUNTS] - Error - could not create account "${accounts[x].email}" (${errors[error.code]})`);
            }

            accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
          });
        }
      });
    });
  }

  if(accounts[x] == undefined) return callback(null);

  accountCreationLoop();
}

/****************************************************************************************************/