'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const commonFormatName      = require(`${__root}/functions/common/format/name`);
const commonAccountsGet     = require(`${__root}/functions/common/accounts/get`);
const commonFormatEmail     = require(`${__root}/functions/common/format/email`);

const databaseManager       = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/

module.exports.updateAccount = (account, databaseConnector, callback) =>
{
  if(account.uuid == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'uuid' });
  if(account.email == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'email' });
  if(account.lastname == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'lastname' });
  if(account.password == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'password' });
  if(account.firstname == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'firstname' });
  if(account.suspended == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'suspended' });

  commonAccountsGet.checkIfAccountExistsFromEmail(account.email, databaseConnector, params, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    if(account.uuid !== accountData.uuid) return callback({ status: 406, code: constants.EMAIL_ALREADY_IN_USE, detail: null });

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

          databaseManager.updateQuery(
          {
            databaseName: params.database.root.label,
            tableName: params.database.root.tables.accounts,
            args: { email: account.email, lastname: account.lastname.toLowerCase(), firstname: account.firstname.toLowerCase(), password: account.password, suspended: account.suspended ? 1 : 0 },
            where: { operator: '=', key: 'uuid', value: account.uuid }

          }, databaseConnector, (error, result) =>
          {
            if(error != null) return callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: error });
            
            return callback(null);
          });
        });
      });
    });
  });
}

/****************************************************************************************************/