'use strict'

const constants             = require(`${__root}/functions/constants`);
const emailSender           = require(`${__root}/functions/email/send`);

/****************************************************************************************************/

module.exports.accountCreated = (accountEmail, password, emailTransporter, callback) =>
{
  accountEmail        == undefined ||
  password            == undefined ||
  emailTransporter    == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  emailSender.sendEmail(
  {
    'from': 'noreply@groupepei.fr',
    'to': accountEmail,
    'subject': 'Votre mot de passe sur PEI Library',
    'html': `<p>Voici votre mot de passe pour vous connecter sur PEI Library : <span>${password}</span></p>`

  }, emailTransporter, (error) =>
  {
    callback(error);
  });
}

/****************************************************************************************************/

module.exports.forgottenPassword = (accountEmail, password, emailTransporter, callback) =>
{
  accountEmail        == undefined ||
  password            == undefined ||
  emailTransporter    == undefined ?

  callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST }) :

  emailSender.sendEmail(
  {
    'from': 'noreply@groupepei.fr',
    'to': accountEmail,
    'subject': 'Votre nouveau mot de passe sur PEI Library',
    'html': `<p>Voici votre nouveau mot de passe pour vous connecter sur PEI Library : <span>${password}</span></p>`

  }, emailTransporter, (error) =>
  {
    callback(error);
  });
}

/****************************************************************************************************/