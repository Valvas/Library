'use strict'

const params                = require(`${__root}/json/config`);
const format                = require(`${__root}/functions/format`);
const constants             = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkAccountFormat = (account, callback) =>
{
  format.checkEmailFormat(account.email, (boolean) =>
  {
    if(boolean == false) return callback({ status: 406, code: constants.WRONG_EMAIL_FORMAT });

    format.checkStrFormat(account.lastname, params.format.account.lastname, (boolean) =>
    {
      if(boolean == false) return callback({ status: 406, code: constants.WRONG_LASTNAME_FORMAT });

      format.checkStrFormat(account.firstname, params.format.account.firstname, (boolean) =>
      {
        if(boolean == false) return callback({ status: 406, code: constants.WRONG_FIRSTNAME_FORMAT });

        account.email.replace(/"/g, '');
        account.lastname.replace(/"/g, '');
        account.firstname.replace(/"/g, '');

        if(account.suspended != true && account.suspended != false) return callback({ status: 406, code: constants.WRONG_SUSPENDED_STATUS_FORMAT });

        return callback(null, account);
      });
    });
  });
}

/****************************************************************************************************/