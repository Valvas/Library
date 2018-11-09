'use strict';

/****************************************************************************************************/

module.exports.checkEmailFormat = (str, callback) =>
{
  callback(new RegExp("^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$").test(str));
}

/****************************************************************************************************/

module.exports.checkStrFormat = (str, rules, callback) =>
{
  if(str == undefined) callback(false);

  else
  {
    var check = true;

    if(rules['min-length'] != false){ if(str.length < rules['min-length']){ check = false; } }
    if(rules['max-length'] != false){ if(str.length > rules['max-length']){ check = false; } }

    if(rules['required-digit'] == true){ if(str.match(/\d/) == null){ check = false; } }
    if(rules['authorized-digit'] == false){ if(str.match(/\d/) != null){ check = false; } }

    if(rules['required-spaces'] == true){ if(str.match(/\s/) == null){ check = false; } }
    if(rules['authorized-spaces'] == false){ if(str.match(/\s/) != null){ check = false; } }

    if(rules['required-lowercase'] == true){ if(str.toUpperCase() == str){ check = false; } }
    if(rules['authorized-lowercase'] == false){ if(str.toUpperCase() != str){ check = false; } }

    if(rules['required-uppercase'] == true){ if(str.toLowerCase() == str){ check = false; } }
    if(rules['authorized-uppercase'] == false){ if(str.toLowerCase() != str){ check = false; } }

    if(rules['required-special'] == true){ if(str.match(/[^\s\w]/) == null){ check = false; } }
    if(rules['authorized-special'] == false){ if(str.match(/[^\s\w]/) != null){ check = false; } }

    callback(check);
  }
}

/****************************************************************************************************/