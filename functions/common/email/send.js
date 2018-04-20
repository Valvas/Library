'use strict'

const params            = require(__root + '/json/params');
const constants         = require(__root + '/functions/constants');
const commonFormatEmail = require(__root + '/functions/common/format/email');

/****************************************************************************************************/

module.exports.sendEmail = (emailObject, transporter, callback) =>
{
  if(emailObject == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Object with email parameters and content not provided' });
  if(transporter == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Email transporter not provided' });

  if(emailObject.receiver == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'No email receiver provided' });
  if(emailObject.object   == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'No email object provided' });
  if(emailObject.content  == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'No email content provided' });

  if(emailObject.object.length  == 0) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Email object is empty' });
  if(emailObject.content.length == 0) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'Email content is empty' });

  commonFormatEmail.checkEmailAddressFormat(emailObject.receiver, (error, emailFormatIsCorrect) =>
  {
    if(error != null) return callback(error);
    if(emailFormatIsCorrect == false) return callback({ status: 406, code: constants.WRONG_EMAIL_FORMAT, detail: 'Receiver email format is invalid' });

    const mailOptions = 
    {
      from: params.transporter.from,
      to: emailObject.receiver,
      subject: emailObject.object,
      html: emailObject.content
    };

    transporter.sendMail(mailOptions, (error, info) => 
    {
      if(error) return callback({ status: 500, code: constants.COULD_NOT_SEND_EMAIL, detail: error.message });

      return callback(null);
    });
  });
}

/****************************************************************************************************/