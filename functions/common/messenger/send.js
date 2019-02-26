'use strict'

const uuid                = require('uuid');
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFormatDate    = require(`${__root}/functions/common/format/date`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);
const commonMessengerGet  = require(`${__root}/functions/common/messenger/get`);

/****************************************************************************************************/
/* Create A New Conversation */
/****************************************************************************************************/

function createConversation(messageContent, receiverUuid, senderUuid, databaseConnection, globalParameters, callback)
{
  createConversationCheckIfReceiverExists(messageContent, receiverUuid, senderUuid, databaseConnection, globalParameters, (error, conversationData) =>
  {
    return callback(error, conversationData);
  });
}

/****************************************************************************************************/

function createConversationCheckIfReceiverExists(messageContent, receiverUuid, senderUuid, databaseConnection, globalParameters, callback)
{
  commonAccountsGet.checkIfAccountExistsFromUuid(receiverUuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error != null) return callback(error);

    if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

    return createConversationCheckIfConversationAlreadyExists(messageContent, accountData, senderUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createConversationCheckIfConversationAlreadyExists(messageContent, receiverData, senderUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.conversation,
    args: [ '*' ],
    where: { condition: 'OR', 0: { condition: 'AND', 0: { operator: '=', key: 'sender', value: senderUuid }, 1: { operator: '=', key: 'receiver', value: receiverData.uuid } }, 1: { condition: 'AND', 0: { operator: '=', key: 'sender', value: receiverData.uuid }, 1: { operator: '=', key: 'receiver', value: senderUuid } } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length > 0) return callback({ status: 406, code: constants.A_CONVERSATION_WITH_THESE_PARTICIPANTS_EXISTS, detail: null });

    return createConversationAddInDatabase(messageContent, receiverData, senderUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createConversationAddInDatabase(messageContent, receiverData, senderUuid, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.conversation,
    args: { uuid: generatedUuid, sender: senderUuid, receiver: receiverData.uuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return createConversationInsertMessageIntoDatabase(messageContent, generatedUuid, receiverData, senderUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function createConversationInsertMessageIntoDatabase(messageContent, conversationUuid, receiverData, senderUuid, databaseConnection, globalParameters, callback)
{
  const currentTimestamp = Date.now();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.message,
    args: { content: messageContent.replace(/\"/g, '\\"'), timestamp: currentTimestamp, author: senderUuid, conversation: conversationUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    commonFormatDate.getStringifyDateFromTimestamp(currentTimestamp, (error, stringifiedDate) =>
    {
      if(error != null) return callback(error);

      const conversationData = { uuid: conversationUuid, receiver: receiverData, message: { timestamp: currentTimestamp, date: stringifiedDate, content: messageContent, authorUuid: senderUuid } };

      return createConversationUpdateReceiverCounter(conversationUuid, senderUuid, conversationData, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function createConversationUpdateReceiverCounter(conversationUuid, senderUuid, conversationData, databaseConnection, globalParameters, callback)
{
  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.counter,
    args: { account: senderUuid, conversation: conversationUuid, amount: 0 }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.messenger.label,
      tableName: globalParameters.database.messenger.tables.counter,
      args: { account: conversationData.receiver.uuid, conversation: conversationUuid, amount: 1 }

    }, databaseConnection, (error) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      return callback(null, conversationData);
    });
  });
}

/****************************************************************************************************/
/* Add A New Message To A Conversation */
/****************************************************************************************************/

function addMessageToConversation(messageContent, conversationUuid, senderUuid, databaseConnection, globalParameters, callback)
{
  addMessageToConversationCheckIfConversationExists(messageContent, conversationUuid, senderUuid, databaseConnection, globalParameters, (error, messageData) =>
  {
    return callback(error, messageData);
  });
}

/****************************************************************************************************/

function addMessageToConversationCheckIfConversationExists(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.conversation,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: conversationUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.CONVERSATION_NOT_FOUND, detail: null });

    return addMessageToConversationCheckIfSenderIsMemberOfTheConversation(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addMessageToConversationCheckIfSenderIsMemberOfTheConversation(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.conversation,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'uuid', value: conversationUuid }, 1: { condition: 'OR', 0: { operator: '=', key: 'sender', value: accountUuid }, 1: { operator: '=', key: 'receiver', value: accountUuid } } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 403, code: constants.NOT_MEMBER_OF_THIS_CONVERSATION, detail: null });

    return addMessageToConversationInsertIntoDatabase(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addMessageToConversationInsertIntoDatabase(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const currentTimestamp = Date.now();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.message,
    args: { content: messageContent.replace(/\"/g, '\\"'), timestamp: currentTimestamp, author: accountUuid, conversation: conversationUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    commonFormatDate.getStringifyDateFromTimestamp(currentTimestamp, (error, stringifiedDate) =>
    {
      if(error != null) return callback(error);

      const messageData = { conversation: conversationUuid, timestamp: currentTimestamp, date: stringifiedDate, content: messageContent, authorUuid: accountUuid };

      return addMessageToConversationUpdateParticipantsMessagesCounter(conversationUuid, accountUuid, messageData, databaseConnection, globalParameters, callback);
    });
  });
}

/****************************************************************************************************/

function addMessageToConversationUpdateParticipantsMessagesCounter(conversationUuid, accountUuid, messageData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.counter,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '!=', key: 'account', value: accountUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.NO_PARTICIPANTS_FOUND_FOR_THIS_CONVERSATION, detail: null });

    var index = 0;

    var browseParticipants = () =>
    {
      databaseManager.updateQuery(
      {
        databaseName: globalParameters.database.messenger.label,
        tableName: globalParameters.database.messenger.tables.counter,
        args: { amount: (result[index].amount + 1) },
        where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '=', key: 'account', value: result[index].account } }

      }, databaseConnection, (error) =>
      {
        if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

        if(result[index += 1] == undefined) return callback(null, messageData);

        browseParticipants();
      });
    }

    browseParticipants();
  });
}

/****************************************************************************************************/

module.exports =
{
  createConversation: createConversation,
  addMessageToConversation: addMessageToConversation
}

/****************************************************************************************************/
