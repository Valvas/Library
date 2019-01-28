'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFormatDate    = require(`${__root}/functions/common/format/date`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/
/* Get One Conversation With Its Content */
/****************************************************************************************************/

function getConversationData(conversationUuid, requestingAccountData, databaseConnection, globalParameters, callback)
{
  getConversationDataCheckIfRequestingAccountIsParticipant(conversationUuid, requestingAccountData, databaseConnection, globalParameters, (error, conversationData) =>
  {
    return callback(error, conversationData);
  });
}

/****************************************************************************************************/

function getConversationDataCheckIfRequestingAccountIsParticipant(conversationUuid, requestingAccountData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.participant,
    args: [ '*' ],
    where: { operator: '=', key: 'conversation', value: conversationUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 403, code: constants.NO_PARTICIPANTS_FOUND_FOR_THIS_CONVERSATION, detail: null });

    var participantsUuid = [];

    for(var x = 0; x < result.length; x++)
    {
      if(result[x].account !== requestingAccountData.uuid) participantsUuid.push(result[x].account);
    }

    if(participantsUuid.length === result.length) return callback({ status: 403, code: constants.ACCOUNT_IS_NOT_A_PARTICIPANT_OF_THIS_CONVERSATION, detail: null });

    if(participantsUuid.length === 0) return callback({ status: 403, code: constants.NO_PARTICIPANTS_FOUND_FOR_THIS_CONVERSATION, detail: null });

    return getConversationDataRetrieveParticipantsData(conversationUuid, participantsUuid, requestingAccountData, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function getConversationDataRetrieveParticipantsData(conversationUuid, participantsUuid, requestingAccountData, databaseConnection, globalParameters, callback)
{
  var participantsData = {}, index = 0;

  participantsData[requestingAccountData.uuid] = { accountUuid: requestingAccountData.uuid, accountLastname: requestingAccountData.lastname, accountFirstname: requestingAccountData.firstname, accountPicture: requestingAccountData.picture };

  var browseParticipants = () =>
  {
    commonAccountsGet.checkIfAccountExistsFromUuid(participantsUuid[index], databaseConnection, globalParameters, (error, accountExists, accountData) =>
    {
      if(error != null) return callback(error);

      participantsData[participantsUuid[index]] = accountExists
      ? { accountUuid: participantsUuid[index], accountLastname: accountData.lastname, accountFirstname: accountData.firstname, accountPicture: accountData.picture }
      : { accountUuid: participantsUuid[index], accountFirstname: null, accountLastname: null };

      if(participantsUuid[index += 1] == undefined) return getConversationDataRetrieveMessages(conversationUuid, participantsData, databaseConnection, globalParameters, callback);

      browseParticipants();
    });
  }

  browseParticipants();
}

/****************************************************************************************************/

function getConversationDataRetrieveMessages(conversationUuid, participantsData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.message,
    args: [ '*' ],
    where: { operator: '=', key: 'conversation', value: conversationUuid },
    order: [ { column: 'timestamp', asc: false } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var index = 0, messagesRetrieved = [];

    var browseMessages = () =>
    {
      getConversationDataBuildMessageData(result[index], participantsData, (error, messageData) =>
      {
        if(error != null) return callback(error);

        messagesRetrieved.push(messageData);

        if(result[index += 1] != undefined && index < 50) return browseMessages();

        const conversationData = { conversationUuid: conversationUuid, conversationParticipants: participantsData, conversationMessages: messagesRetrieved.reverse() };
        
        return callback(null, conversationData);
      });
    }

    browseMessages();
  });
}

/****************************************************************************************************/

function getConversationDataBuildMessageData(messageData, participantsData, callback)
{
  var messageToReturn = {};

  commonFormatDate.getStringifyDateFromTimestamp(messageData.timestamp, (error, stringifiedDate) =>
  {
    if(error != null) return callback(error);

    messageToReturn.messageId = messageData.timestamp;
    messageToReturn.authorUuid = messageData.author;
    messageToReturn.authorName = participantsData[messageData.author].accountLastname == null ? '?' : `${participantsData[messageData.author].accountFirstname.charAt(0).toUpperCase()}${participantsData[messageData.author].accountFirstname.slice(1).toLowerCase()} ${participantsData[messageData.author].accountLastname.charAt(0).toUpperCase()}${participantsData[messageData.author].accountLastname.slice(1).toLowerCase()}`;
    messageToReturn.messageContent = messageData.content;
    messageToReturn.messageDate = stringifiedDate;

    return callback(null, messageToReturn);
  });
}

/****************************************************************************************************/
/* Get Conversations With Their Content */
/****************************************************************************************************/

function getConversations(accountData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.participant,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountData.uuid }, 1: { operator: '=', key: 'removed', value: 0 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var index = 0, conversationsToReturn = [];

    var browseConversations = () =>
    {
      var currentConversationObject = {};

      currentConversationObject.uuid = result[index].conversation;
      currentConversationObject.newMessages = result[index].messages;

      getConversationsRetrieveParticipantsData(result[index].conversation, accountData, databaseConnection, globalParameters, (error, participantsData, conversationMessages) =>
      {
        if(error != null) return callback(error);

        currentConversationObject.messages = conversationMessages;
        currentConversationObject.participants = participantsData;

        conversationsToReturn.push(currentConversationObject);

        if(result[index += 1] == undefined) return callback(null, conversationsToReturn);

        browseConversations();
      });
    }

    browseConversations();
  });
}

/****************************************************************************************************/

function getConversationsRetrieveParticipantsData(conversationUuid, currentAccountData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.participant,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '!=', key: 'account', value: currentAccountData.uuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.NO_PARTICIPANTS_FOUND_FOR_THIS_CONVERSATION, detail: null });

    var index = 0, participantsData = {};

    var browseParticipants = () =>
    {
      commonAccountsGet.checkIfAccountExistsFromUuid(result[index].account, databaseConnection, globalParameters, (error, accountExists, accountData) =>
      {
        if(error != null) return callback(error);

        participantsData[result[index].account] = {};

        participantsData[result[index].account] = accountExists
        ? { accountUuid: accountData.uuid, accountEmail: accountData.email, accountLastname: accountData.lastname, accountFirstname: accountData.firstname, accountPicture: accountData.picture }
        : { accountUuid: result[index].account, accountEmail: null, accountLastname: null, accountFirstname: null, accountPicture: null };

        if(result[index += 1] == undefined) return getConversationsRetrieveMessages(conversationUuid, participantsData, currentAccountData, databaseConnection, globalParameters, callback);

        browseParticipants();
      });
    }

    browseParticipants();
  });
}

/****************************************************************************************************/

function getConversationsRetrieveMessages(conversationUuid, participantsData, currentAccountData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.message,
    args: [ '*' ],
    where: { operator: '=', key: 'conversation', value: conversationUuid },
    order: [ { column: 'timestamp', asc: false } ]

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, []);

    var index = 0, messages = [];

    var browseMessages = () =>
    {
      getConversationsBuildMessageData(result[index], participantsData, currentAccountData, (error, currentMessageData) =>
      {
        if(error != null) return callback(error);

        messages.push(currentMessageData);

        if(result[index += 1] == undefined || index === 50) return callback(null, participantsData, messages.reverse());

        browseMessages();
      });
    }

    browseMessages();
  });
}

/****************************************************************************************************/

function getConversationsBuildMessageData(messageData, participantsData, currentAccountData, callback)
{
  var messageToReturn = {};

  commonFormatDate.getStringifyDateFromTimestamp(messageData.timestamp, (error, stringifiedDate) =>
  {
    if(error != null) return callback(error);

    messageToReturn.messageId = messageData.timestamp;
    messageToReturn.authorUuid = messageData.author;
    messageToReturn.authorName = messageData.author === currentAccountData.uuid
    ? `${currentAccountData.firstname.charAt(0).toUpperCase()}${currentAccountData.firstname.slice(1).toLowerCase()} ${currentAccountData.lastname.charAt(0).toUpperCase()}${currentAccountData.lastname.slice(1).toLowerCase()}`
    : participantsData[messageData.author].accountEmail == null ? '?' : `${participantsData[messageData.author].accountFirstname.charAt(0).toUpperCase()}${participantsData[messageData.author].accountFirstname.slice(1).toLowerCase()} ${participantsData[messageData.author].accountLastname.charAt(0).toUpperCase()}${participantsData[messageData.author].accountLastname.slice(1).toLowerCase()}`;
    messageToReturn.messageContent = messageData.content;
    messageToReturn.messageDate = stringifiedDate;

    return callback(null, messageToReturn);
  });
}

/****************************************************************************************************/
/* Check If Conversation Exists */
/****************************************************************************************************/

function checkIfConversationExists(conversationUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.conversation,
    args: [ '*' ],
    where: { operator: '=', key: 'uuid', value: conversationUuid }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, false);

    return callback(null, true, result[0]);
  });
}

/****************************************************************************************************/
/* Get Accounts List Who Are Not Already In A Conversation With User */
/****************************************************************************************************/

function getAccountsWithWhomStartingAConversation(accountUuid, databaseConnection, globalParameters, callback)
{
  getAccountsWithWhomStartingAConversationRetrieveConversationsFromDatabase(accountUuid, databaseConnection, globalParameters, (error, accountsToReturn) =>
  {
    return callback(error, accountsToReturn);
  });
}

/****************************************************************************************************/

function getAccountsWithWhomStartingAConversationRetrieveConversationsFromDatabase(accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.participant,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'account', value: accountUuid }, 1: { operator: '=', key: 'removed', value: 0 } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    var index = 0, accountsNotToRetrieve = [ accountUuid ];

    if(result.length === 0) return getAccountsWithWhomStartingAConversationRetrieveAccountsFromDatabase(accountsNotToRetrieve, databaseConnection, globalParameters, callback);

    var browseConversations = () =>
    {
      getAccountsWithWhomStartingAConversationGetParticipantsFromConversation(accountUuid, result[index].conversation, databaseConnection, globalParameters, (error, accountRetrieved) =>
      {
        if(error != null) return callback(error);

        accountsNotToRetrieve.push(accountRetrieved);

        if(result[index += 1] == undefined) return getAccountsWithWhomStartingAConversationRetrieveAccountsFromDatabase(accountsNotToRetrieve, databaseConnection, globalParameters, callback);
        
        browseConversations();
      });
    }

    browseConversations();
  });
}

/****************************************************************************************************/

function getAccountsWithWhomStartingAConversationGetParticipantsFromConversation(accountUuid, conversationUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.chat.label,
    tableName: globalParameters.database.chat.tables.participant,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '!=', key: 'account', value: accountUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.NO_PARTICIPANTS_FOUND_FOR_THIS_CONVERSATION, detail: null });

    return callback(null, result[0].account);
  });
}

/****************************************************************************************************/

function getAccountsWithWhomStartingAConversationRetrieveAccountsFromDatabase(accountsNotToRetrieve, databaseConnection, globalParameters, callback)
{
  commonAccountsGet.getAllAccountsWithPictures(databaseConnection, globalParameters, (error, accountsList) =>
  {
    if(error != null) return callback(error);

    var accountsToReturn = [];

    for(var x = 0; x < accountsList.length; x++)
    {
      if(accountsNotToRetrieve.includes(accountsList[x].uuid) == false && accountsList[x].suspended == false) accountsToReturn.push(accountsList[x]);
    }

    return callback(null, accountsToReturn);
  });
}

/****************************************************************************************************/

module.exports =
{
  getConversations: getConversations,
  getConversationData: getConversationData,
  checkIfConversationExists: checkIfConversationExists,
  getAccountsWithWhomStartingAConversation: getAccountsWithWhomStartingAConversation
}

/****************************************************************************************************/