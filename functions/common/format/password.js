'use strict'

const constants = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.checkPasswordFormat = (password, globalParameters, callback) =>
{
  if(password == undefined)         return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'password' });
  if(globalParameters == undefined) return callback({ status: 406, code: constants.MISSING_DATA_IN_REQUEST, detail: 'globalParameters' });

  if(password.length < globalParameters.passwordRules.minLength) return callback({ status: 406, code: constants.PASSWORD_DOES_NOT_MEET_REQUIREMENTS, detail: 'Mot de passe trop court' });
  if(password.length > globalParameters.passwordRules.maxLength) return callback({ status: 406, code: constants.PASSWORD_DOES_NOT_MEET_REQUIREMENTS, detail: 'Mot de passe trop long' });

  const digits      = password.match(/[0-9]/g) == null ? 0 : password.match(/[0-9]/g).length;
  const lowercases  = password.match(/[a-z]/g) == null ? 0 : password.match(/[a-z]/g).length;
  const uppercases  = password.match(/[A-Z]/g) == null ? 0 : password.match(/[A-Z]/g).length;
  const specials    = password.match(/[^a-zA-Z\d\s]/g) == null ? 0 : password.match(/[^a-zA-Z\d\s]/g).length;

  if(digits < globalParameters.passwordRules.minDigits)          return callback({ status: 406, code: constants.PASSWORD_DOES_NOT_MEET_REQUIREMENTS, detail: 'Nombre de chiffres requis non respecté' });
  if(specials < globalParameters.passwordRules.minSpecial)       return callback({ status: 406, code: constants.PASSWORD_DOES_NOT_MEET_REQUIREMENTS, detail: 'Nombre de caractères spéciaux requis non respecté' });
  if(lowercases < globalParameters.passwordRules.minLowerCases)  return callback({ status: 406, code: constants.PASSWORD_DOES_NOT_MEET_REQUIREMENTS, detail: 'Nombre de lettres minuscules requises non respecté' });
  if(uppercases < globalParameters.passwordRules.minUpperCases)  return callback({ status: 406, code: constants.PASSWORD_DOES_NOT_MEET_REQUIREMENTS, detail: 'Nombre de lettres capitales requises non respecté' });

  return callback(null);
}

/****************************************************************************************************/