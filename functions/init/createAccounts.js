'use strict'

const params                = require(`${__root}/json/params`);
const errors                = require(`${__root}/json/errors`);
const accounts              = require(`${__root}/json/accounts`);
const constants             = require(`${__root}/functions/constants`);
const encryption            = require(`${__root}/functions/encryption`);
const accountsGet           = require(`${__root}/functions/accounts/get`);
const accountsCheck         = require(`${__root}/functions/accounts/check`);
const accountsCreate        = require(`${__root}/functions/accounts/create`);
const accountsUpdate        = require(`${__root}/functions/accounts/update`);

//To uncomment when updated database manager will be set for all the project
//const databaseManager     = require(`${__root}/functions/database/${params.database.dbms}`);

//To remove when updated database manager will be set for all the project
const databaseManager       = require(`${__root}/functions/database/MySQLv2`);

/****************************************************************************************************/

module.exports.createAccounts = (databaseConnector, transporter, callback) =>
{
  if(databaseConnector == undefined) callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST });

  else
  {
    var x = 0;

    var accountCreationLoop = () =>
    {
      accountsGet.getAccountUsingEmail(accounts[x].email, databaseConnector, (error, account) =>
      {
        if(error != null && (error.status == 500 || error.status == 406))
        {
          console.log(`[ACCOUNTS] - Error - could not create account "${accounts[x].email}" (${errors[error.code]})`);
          accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
        }

        else
        {
          accountsCheck.checkAccountFormat(
          {
            email: `${accounts[x].email}@groupepei.fr`,
            lastname: accounts[x].lastname,
            firstname: accounts[x].firstname,
            suspended: accounts[x].suspended

          }, databaseConnector, (error, correctedAccount) =>
          {
            if(error != null)
            {
              console.log(`[ACCOUNTS] - Error - could not create account "${accounts[x].email}" (${errors[error.code]})`);
              accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
            }

            else
            {
              //Account already exists, need to be updated and not created
              if(account != undefined)
              {
                accountsUpdate.updateAccount(
                {
                  id: account.id,
                  uuid: account.uuid,
                  email: account.email,
                  lastname: correctedAccount.lastname,
                  firstname: correctedAccount.firstname,
                  password: account.password,
                  suspended: correctedAccount.suspended

                }, databaseConnector, (error) =>
                {
                  if(error != null)
                  {
                    console.log(`[ACCOUNTS] - Error - could not create account "${accounts[x].email}" (${errors[error.code]})`);
                    accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
                  }

                  else
                  {
                    console.log(`[ACCOUNTS] - Update - account "${accounts[x].email}" successfully updated`);
                    accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
                  }
                });
              }

              //Account not found, need to be created
              else
              {
                accountsCreate.createAccount(
                {
                  email: accounts[x].email,
                  lastname: correctedAccount.lastname,
                  firstname: correctedAccount.firstname,
                  suspended: correctedAccount.suspended

                }, databaseConnector, transporter, (error) =>
                {
                  if(error != null)
                  {
                    //Account has been created but the email with the password could not be sent (normal here because username could not be a real email address)
                    if(error.code == constants.MAIL_NOT_SENT)
                    {
                      console.log(`[ACCOUNTS] - Creation - account "${accounts[x].email}" successfully created`);
                      accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
                    }

                    //Another error occurred that avoided account creation 
                    else
                    {
                      console.log(`[ACCOUNTS] - Error - could not create account "${accounts[x].email}" (${errors[error.code]})`);
                      accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
                    }
                  }

                  else
                  {
                    console.log(`[ACCOUNTS] - Creation - account "${accounts[x].email}" successfully created`);
                    accounts[x += 1] == undefined ? callback(null) : accountCreationLoop();
                  }
                });
              }
            }
          });
        }
      });
    }

    if(accounts[x] == undefined)
    {
      console.log('[ACCOUNTS] - Info - no accounts to create');
      callback(null);
    }

    else
    {
      accountCreationLoop();
    }
  }
}

/****************************************************************************************************/