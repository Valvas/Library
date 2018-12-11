'use strict';

const bcrypt            = require('bcrypt');
const constants         = require(`${__root}/functions/constants`);

/****************************************************************************************************/

module.exports.encryptPassword = (password, params, callback) =>
{
  bcrypt.hash(password, params.salt, (error, result) =>
  {
    if(error) return callback({status: 500, code: constants.ENCRYPTION_FAILED });
    
    return callback(null, result);
  });
}

/****************************************************************************************************/

module.exports.getRandomPassword = (params, callback) =>
{
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var password = '', x = 0;

  var loop = () =>
  {
    password += characters.charAt(Math.floor(Math.random() * characters.length));

    (x += 1) < 8 ? loop() : 
      
    bcrypt.hash(password, params.salt, (error, result) =>
    {
      error != undefined ? callback({ status: 500, code: constants.ENCRYPTION_FAILED, detail: error }) : callback(null, { clear: password, encrypted: result });
    });
  }

  loop();
}

/****************************************************************************************************/

module.exports.getInitPassword = (callback) =>
{
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var password = '', x = 0;

  for(var x = 0; x < 32; x++)
  {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return callback(null, password);
}

/****************************************************************************************************/

module.exports.generateRandomPassword = (globalParameters, callback) =>
{
  if((globalParameters.passwordRules.minLowerCases + globalParameters.passwordRules.minUpperCases + globalParameters.passwordRules.minDigits + globalParameters.passwordRules.minSpecial) > globalParameters.passwordRules.generatedLength) return callback({ status: 406, code: constants.RANDOM_PASSWORD_SIZE_GENERATION_DOES_NOT_MEET_REQUIREMENTS, detail: null });

  const lowerCases  = 'abcdefghijklmnopqrstuvwxyz';
  const upperCases  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits      = '0123456789';
  const specials    = '#$*+-/=?!@';

  var fillerCharacters = lowerCases;

  if(globalParameters.passwordRules.minUpperCases > 0) fillerCharacters = fillerCharacters.concat(upperCases);
  if(globalParameters.passwordRules.minDigits > 0) fillerCharacters = fillerCharacters.concat(digits);
  if(globalParameters.passwordRules.minSpecial > 0) fillerCharacters = fillerCharacters.concat(specials);

  var specialsSelected = [], lowerCasesSelected = [], upperCasesSelected = [], digitsSelected = [], charactersToFill = [];

  for(var x = 0; x < globalParameters.passwordRules.minLowerCases; x++) lowerCasesSelected.push(lowerCases.charAt(Math.floor(Math.random() * lowerCases.length)));
  for(var x = 0; x < globalParameters.passwordRules.minUpperCases; x++) upperCasesSelected.push(upperCases.charAt(Math.floor(Math.random() * upperCases.length)));
  for(var x = 0; x < globalParameters.passwordRules.minDigits; x++) digitsSelected.push(digits.charAt(Math.floor(Math.random() * digits.length)));
  for(var x = 0; x < globalParameters.passwordRules.minSpecial; x++) specialsSelected.push(specials.charAt(Math.floor(Math.random() * specials.length)));

  const limit = globalParameters.passwordRules.generatedLength - globalParameters.passwordRules.minUpperCases - globalParameters.passwordRules.minDigits - globalParameters.passwordRules.minSpecial - globalParameters.passwordRules.minLowerCases;

  for(var x = 0; x < limit; x++)
  {
    charactersToFill.push(fillerCharacters.charAt(Math.floor(Math.random() * fillerCharacters.length)));
  }

  var passwordArray = lowerCasesSelected.concat(specialsSelected.concat(upperCasesSelected.concat(digitsSelected.concat(charactersToFill))));

  var j, x;

  for(var i = passwordArray.length - 1; i > 0; i--)
  {
    j = Math.floor(Math.random() * (i + 1));
    x = passwordArray[i];
    passwordArray[i] = passwordArray[j];
    passwordArray[j] = x;
  }

  const clearPassword = passwordArray.join('');

  bcrypt.hash(clearPassword, globalParameters.salt, (error, encryptedPassword) =>
  {
    if(error) return callback({ status: 500, code: constants.ENCRYPTION_FAILED, detail: error });

    return callback(null, clearPassword, encryptedPassword);
  });
}

/****************************************************************************************************/