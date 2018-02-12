'use strict'

const fs          = require('fs');
const nodemailer  = require('nodemailer');
const errors      = require(`${__root}/json/errors`);
const constants   = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkEmailSending = (params, callback) =>
{
  var transporter = nodemailer.createTransport(
  {
    host: params.transporter.address,
    port: params.transporter.port,
    secure: params.transporter.secure,
    auth: 
    {
      user: params.transporter.user,
      pass: params.transporter.password
    },
    tls: 
    {
      rejectUnauthorized: false
    }
  });

  transporter.verify((err, success) =>
  {
    err ? callback({ status: 500, message: errors[constants.TEST_EMAIL_FAILED] }) : callback(null);
  });
}

/****************************************************************************************************/