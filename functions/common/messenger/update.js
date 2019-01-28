'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);

/****************************************************************************************************/
/* Get One Conversation With Its Content */
/****************************************************************************************************/

function updateMessageAmountInDatabase(accountUuid, conversationUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.updateQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.participant,
    args: { messages: 0 },
    where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '=', key: 'account', value: accountUuid } }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null);
  });
}

/****************************************************************************************************/
/* Update Account Connection Status On Messenger */
/****************************************************************************************************/

function updateAccountStatus(accountUuid, status, databaseConnection, globalParameters, callback)
{
  const availableStatus = Object.values(globalParameters.messenger.status);

  if(availableStatus.includes(status) == false) return callback({ status: 406, code: constants.MESSENGER_STATUS_NOT_AVAILABLE, detail: null });

  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.status,
    args: [ '*' ],
    where: { operator: '=', key: 'account', value: accountUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    result.length === 0

    ? databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.chat.label,
      tableName: globalParameters.database.chat.tables.status,
      args: { account: accountUuid, status: status }

    }, databaseConnection, (error) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      return callback(null);
    })

    : databaseManager.updateQuery(
    {
      databaseName: globalParameters.database.chat.label,
      tableName: globalParameters.database.chat.tables.status,
      args: { status: status },
      where: { operator: '=', key: 'account', value: accountUuid }

    }, databaseConnection, (error) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      return callback(null);
    });
  });
}

/****************************************************************************************************/

module.exports =
{
  updateAccountStatus: updateAccountStatus,
  updateMessageAmountInDatabase: updateMessageAmountInDatabase
}

/****************************************************************************************************/