'use strict'

const params                = require(`${__root}/json/params`);
const constants             = require(`${__root}/functions/constants`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const commonFormatName      = require(`${__root}/functions/common/format/name`);
const commonFormatEmail     = require(`${__root}/functions/common/format/email`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.updateAccount = (account, databaseConnector, callback) =>
{
  account.id            == undefined ||
  account.uuid          == undefined ||
  account.email         == undefined ||
  account.lastname      == undefined ||
  account.firstname     == undefined ||
  account.password      == undefined ||
  account.suspended     == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  accountsGet.getAccountUsingEmail(account.email, databaseConnector, (error, searchedAccount) =>
  {
    if(error != null && (error.status == 500 || error.status == 406)) callback(error);

    else
    {
      commonFormatEmail.checkEmailAddressFormat(account.email, (error, boolean) =>
      {
        if(error != null) callback(error);

        else
        {
          if(boolean == false) callback({ status: 406, code: constants.WRONG_EMAIL_FORMAT, target: 'email' });

          else
          {
            commonFormatName.checkNameFormat(account.lastname, (error, boolean) =>
            {
              if(error != null) callback(error);

              else
              {
                if(boolean == false) callback({ status: 406, code: constants.WRONG_LASTNAME_FORMAT, target: 'lastname' });

                else
                {
                  commonFormatName.checkNameFormat(account.firstname, (error, boolean) =>
                  {
                    if(error != null) callback(error);

                    else
                    {
                      if(error == null && account.id != searchedAccount.id) callback({ status: 406, code: constants.EMAIL_ALREADY_IN_USE });

                      else
                      {
                        databaseManager.updateQuery(
                        {
                          'databaseName': params.database.root.label,
                          'tableName': params.database.root.tables.accounts,
                          'args': { 'email': account.email, 'lastname': account.lastname.toLowerCase(), 'firstname': account.firstname.toLowerCase(), 'password': account.password, 'suspended': account.suspended ? 1 : 0 },
                          'where': { '0': { 'operator': '=', '0': { 'key': 'id', 'value': account.id } } }

                        }, databaseConnector, (boolean, updatedRowOrErrorMessage) =>
                        {
                          boolean == false ? callback({ status: 500, code: constants.SQL_SERVER_ERROR, detail: updatedRowOrErrorMessage }) : callback(null);
                        });
                      }
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  });
}

/****************************************************************************************************/