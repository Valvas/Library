'use strict'

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.sendEmail = (emailOptions, emailTransporter, callback) =>
{
  emailOptions.from      == undefined ||
  emailOptions.to        == undefined ||
  emailOptions.subject   == undefined ||
  emailOptions.html      == undefined ||
  emailTransporter       == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  emailTransporter.sendMail(emailOptions, (err, info) => 
  {
    err ? callback({ status: 500, code: constants.MAIL_NOT_SENT }) : callback(null);
  });
}

/****************************************************************************************************/