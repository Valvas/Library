'use strict'

const uuid                = require('uuid');
const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);
const commonMessengerGet  = require(`${__root}/functions/common/messenger/get`);

/****************************************************************************************************/
/* Add A New Message To A Conversation */
/****************************************************************************************************/

function addMessageToConversation(messageContent, conversationUuid, participants, accountUuid, databaseConnection, globalParameters, callback)
{
  if(conversationUuid == null)
  {
    addMessageToConversationCheckIfParticipantsExist(messageContent, participants, accountUuid, databaseConnection, globalParameters, (error, newConversationUuid) =>
    {
      return callback(error, newConversationUuid);
    });
  }

  else
  {
    addMessageToConversationCheckIfConversationExists(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, (error) =>
    {
      return callback(error);
    });
  }
}

/****************************************************************************************************/

function addMessageToConversationCheckIfConversationExists(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  commonMessengerGet.checkIfConversationExists(conversationUuid, databaseConnection, globalParameters, (error, conversationExists) =>
  {
    if(error != null) return callback(error);

    if(conversationExists == false) return callback({ status: 404, code: constants.CONVERSATION_NOT_FOUND, detail: null });

    return addMessageToConversationCheckIfSenderIsMemberOfTheConversation(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addMessageToConversationCheckIfSenderIsMemberOfTheConversation(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.participant,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '=', key: 'account', value: accountUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 403, code: constants.NOT_MEMBER_OF_THIS_CONVERSATION, detail: null });

    return addMessageToConversationInsertIntoDatabase(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addMessageToConversationCheckIfParticipantsExist(messageContent, participants, accountUuid, databaseConnection, globalParameters, callback)
{
  if(participants.length === 0) return callback({ status: 406, code: constants.NO_PARTICIPANTS_PROVIDED_FOR_THIS_CONVERSATION, detail: null });

  var index = 0;

  var browseParticipants = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(participants[index], databaseConnection, globalParameters, (error, accountExists) =>
    {
      if(error != null) return callback(error);

      if(accountExists == false) return callback({ status: 404, code: constants.ACCOUNT_NOT_FOUND, detail: null });

      if(participants[index += 1] == undefined) return addMessageToConversationFindConversationFromParticipants(messageContent, participants, accountUuid, databaseConnection, globalParameters, callback);

      browseParticipants();
    });
  }

  browseParticipants();
}

/****************************************************************************************************/

function addMessageToConversationFindConversationFromParticipants(messageContent, participants, accountUuid, databaseConnection, globalParameters, callback)
{
  var conversationCounter = {};

  participants.push(accountUuid);

  var index = 0;

  var browseParticipants = () =>
  {
    databaseManager.selectQuery(
    {
      databaseName: globalParameters.database.chat.label,
      tableName: globalParameters.database.chat.tables.participant,
      args: [ '*' ],
      where: { operator: '=', key: 'account', value: participants[index] }

    }, databaseConnection, (error, result) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      for(var x = 0; x < result.length; x++)
      {
        if(conversationCounter[result[x].conversation] == undefined) conversationCounter[result[x].conversation] = 0;

        conversationCounter[result[x].conversation] += 1;
      }

      if(participants[index += 1] != undefined) return browseParticipants();

      for(var key in conversationCounter)
      {
        if(conversationCounter[key] === participants.length) return callback({ status: 406, code: constants.A_CONVERSATION_WITH_THESE_PARTICIPANTS_EXISTS, detail: null });
      }

      return addMessageToConversationCreateConversation(messageContent, participants, accountUuid, databaseConnection, globalParameters, callback);
    });
  }

  browseParticipants();
}

/****************************************************************************************************/

function addMessageToConversationCreateConversation(messageContent, participants, accountUuid, databaseConnection, globalParameters, callback)
{
  const generatedUuid = uuid.v4();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.conversation,
    args: { uuid: generatedUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return addMessageToConversationAddParticipants(messageContent, generatedUuid, participants, accountUuid, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function addMessageToConversationAddParticipants(messageContent, conversationUuid, participants, accountUuid, databaseConnection, globalParameters, callback)
{
  var index = 0;

  var browseParticipants = () =>
  {
    databaseManager.insertQuery(
    {
      databaseName: globalParameters.database.chat.label,
      tableName: globalParameters.database.chat.tables.participant,
      args: { conversation: conversationUuid, account: participants[index], removed: 0, messages: participants[index] === accountUuid ? 0 : 1 }
  
    }, databaseConnection, (error) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
  
      if(participants[index += 1] == undefined) return addMessageToConversationInsertIntoDatabase(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback);

      browseParticipants();
    });
  }

  browseParticipants();
}

/****************************************************************************************************/

function addMessageToConversationInsertIntoDatabase(messageContent, conversationUuid, accountUuid, databaseConnection, globalParameters, callback)
{
  const currentTimestamp = Date.now();

  databaseManager.insertQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.message,
    args: { content: messageContent.replace(/\"/g, '\\"'), timestamp: currentTimestamp, author: accountUuid, conversation: conversationUuid }

  }, databaseConnection, (error) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    return callback(null, conversationUuid);
  });
}

/****************************************************************************************************/

module.exports =
{
  addMessageToConversation: addMessageToConversation
}

/****************************************************************************************************/