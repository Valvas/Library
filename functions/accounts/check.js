'use strict';

var params                = require(`${__root}/json/config`);
var format                = require(`${__root}/functions/format`);
var constants             = require(`${__root}/functions/constants`);
var databaseManager       = require(`${__root}/functions/database/${params.database.dbms}`);

/****************************************************************************************************/

module.exports.checkAccountFormat = (obj, databaseConnector, callback) =>
{
  format.checkEmailFormat(obj.email, (boolean) =>
  {
    boolean == false ? callback(false, 406, constants.WRONG_EMAIL_FORMAT) :

    format.checkStrFormat(obj.lastname, params.format.account.lastname, (boolean) =>
    {
      boolean == false ? callback(false, 406, constants.WRONG_LASTNAME_FORMAT) :

      format.checkStrFormat(obj.firstname, params.format.account.firstname, (boolean) =>
      {
        boolean == false ? callback(false, 406, constants.WRONG_FIRSTNAME_FORMAT) :

        databaseManager.selectQuery(
        {
          'databaseName': params.database.name,
          'tableName': params.database.tables.accounts,

          'args': { '0': 'id' },

          'where':
          {
            '=':
            {
              '0':
              {
                'key': 'email',
                'value': obj.email
              }
            }
          }
        }, databaseConnector, (boolean, accountOrErrorMessage) =>
        {
          if(boolean == false) callback(false, 500, constants.SQL_SERVER_ERROR);

          else
          {
            accountOrErrorMessage.length > 0 ? callback(false, 406, constants.EMAIL_ALREADY_IN_USE) : callback(true);
          }
        });
      });
    });
  });
}

/****************************************************************************************************/