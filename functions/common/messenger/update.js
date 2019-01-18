'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* Get One Conversation With Its Content */
/****************************************************************************************************/

function updateMessageAmountInDatabase(accountUuid, conversationUuid, databaseConnection, globalParameters, callback)
{
  return callback(null);
}

/****************************************************************************************************/

module.exports =
{
  updateMessageAmountInDatabase: updateMessageAmountInDatabase
}

/****************************************************************************************************/