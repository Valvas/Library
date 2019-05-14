'use strict'

const constants           = require(`${__root}/functions/constants`);
const databaseManager     = require(`${__root}/functions/database/MySQLv3`);
const commonFormatDate    = require(`${__root}/functions/common/format/date`);
const commonAccountsGet   = require(`${__root}/functions/common/accounts/get`);

/****************************************************************************************************/
/* Retrieve All Conversations For Provided Account */
/****************************************************************************************************/

function retrieveMessengerData(accountUuid, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.conversation,
    args: [ '*' ],
    where: { condition: 'OR', 0: { operator: '=', key: 'sender', value: accountUuid }, 1: { operator: '=', key: 'receiver', value: accountUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error !== null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback(null, {});

    var index = 0, messengerData = {};

    var browseConversations = () =>
    {
      retrieveMessengerDataGetReceiverData(result[index].uuid, accountUuid, result[index].sender === accountUuid ? result[index].receiver : result[index].sender, databaseConnection, globalParameters, (error, receiverData, counter, messages) =>
      {
        if(error !== null) return callback(error);

        if(receiverData.suspended === false)
        {
          messengerData[result[index].uuid] = { receiver: receiverData, counter: counter, messages: messages };
        }

        if(result[index += 1] === undefined) return callback(null, messengerData);

        browseConversations();
      });
    }

    browseConversations();
  });
}

/****************************************************************************************************/

function retrieveMessengerDataGetReceiverData(conversationUuid, accountUuid, receiverUuid, databaseConnection, globalParameters, callback)
{
  commonAccountsGet.checkIfAccountExistsFromUuid(receiverUuid, databaseConnection, globalParameters, (error, accountExists, accountData) =>
  {
    if(error !== null) return callback(error);

    if(accountExists === false)
    {
      return retrieveMessengerDataGetCounter(conversationUuid, accountUuid, null, databaseConnection, globalParameters, callback);
    }

    return retrieveMessengerDataGetCounter(conversationUuid, accountUuid, { uuid: accountData.uuid, email: accountData.email, lastname: accountData.lastname, firstname: accountData.firstname, picture: accountData.picture, suspended: accountData.suspended }, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function retrieveMessengerDataGetCounter(conversationUuid, accountUuid, receiverData, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.counter,
    args: [ '*' ],
    where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '=', key: 'account', value: accountUuid } }

  }, databaseConnection, (error, result) =>
  {
    if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

    if(result.length === 0) return callback({ status: 404, code: constants.CONVERSATION_MESSAGES_COUNTER_NOT_FOUND, detail: null });

    return retrieveMessengerDataGetMessages(conversationUuid, receiverData, result[0].amount, databaseConnection, globalParameters, callback);
  });
}

/****************************************************************************************************/

function retrieveMessengerDataGetMessages(conversationUuid, receiverData, counter, databaseConnection, globalParameters, callback)
{
  databaseManager.selectQuery(
  {
    databaseName: globalParameters.database.messenger.label,
    tableName: globalParameters.database.messenger.tables.message,
    args: [ '*' ],
    where: { operator: '=', key: 'conversation', value: conversationUuid },
    order: [ { column: 'timestamp', asc: false } ]

  }, databaseConnection, (error, result) =>
  {
    if(error !== null)
    {
      return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });
    }

    if(result.length === 0)
    {
      return callback(null, receiverData, counter, []);
    }

    let messages = [];

    for(let x = 0; x < result.length; x++)
    {
      messages.push(
      {
        timestamp: result[x].timestamp,
        date: commonFormatDate.getStringifiedDateTimeFromTimestampSync(result[x].timestamp),
        content: result[x].content,
        author: result[x].author
      });
    }

    return callback(null, receiverData, counter, messages);
  });
}

/****************************************************************************************************/
/* Retrieve A Specific Conversation */
/****************************************************************************************************/

function retrieveConversationData(conversationUuid, hasBeenOpenned, accountUuid, databaseConnection, globalParameters, callback)
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

    hasBeenOpenned ?

    databaseManager.updateQuery(
    {
      databaseName: globalParameters.database.messenger.label,
      tableName: globalParameters.database.messenger.tables.counter,
      args: { amount: 0 },
      where: { condition: 'AND', 0: { operator: '=', key: 'conversation', value: conversationUuid }, 1: { operator: '=', key: 'account', value: accountUuid } }

    }, databaseConnection, (error) =>
    {
      if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

      retrieveMessengerDataGetReceiverData(result[0].uuid, accountUuid, result[0].sender === accountUuid ? result[0].receiver : result[0].sender, databaseConnection, globalParameters, (error, receiverData, counter, messages) =>
      {
        if(error != null) return callback(error);

        return callback(null, { receiver: receiverData, counter: counter, messages: messages });
      });
    }) :

    retrieveMessengerDataGetReceiverData(result[0].uuid, accountUuid, result[0].sender === accountUuid ? result[0].receiver : result[0].sender, databaseConnection, globalParameters, (error, receiverData, counter, messages) =>
    {
      if(error != null) return callback(error);

      return callback(null, { receiver: receiverData, counter: counter, messages: messages });
    });
  });
}

/****************************************************************************************************/
/* Get List Of Accounts Which Do Not Already Have Started A Conversation With Account Provided */
/****************************************************************************************************/

function getAccountsWithWhomToStartConversation(accountUuid, databaseConnection, globalParameters, callback)
{
  commonAccountsGet.getAllAccountsWithPictures(databaseConnection, globalParameters, (error, accounts) =>
  {
    if(error != null) return callback(error);

    var accountsList = [];

    var index = 0;

    var browseAccounts = () =>
    {
      if(accounts[index].uuid === accountUuid)
      {
        if(accounts[index += 1] == undefined) return callback(null, accountsList);

        return browseAccounts();
      }

      if(accounts[index].suspended)
      {
        if(accounts[index += 1] == undefined) return callback(null, accountsList);

        return browseAccounts();
      }

      databaseManager.selectQuery(
      {
        databaseName: globalParameters.database.messenger.label,
        tableName: globalParameters.database.messenger.tables.conversation,
        args: [ '*' ],
        where: { condition: 'OR', 0: { condition: 'AND', 0: { operator: '=', key: 'receiver', value: accountUuid }, 1: { operator: '=', key: 'sender', value: accounts[index].uuid } }, 1: { condition: 'AND', 0: { operator: '=', key: 'sender', value: accountUuid }, 1: { operator: '=', key: 'receiver', value: accounts[index].uuid } } }

      }, databaseConnection, (error, result) =>
      {
        if(error != null) return callback({ status: 500, code: constants.DATABASE_QUERY_FAILED, detail: error });

        if(result.length === 0) accountsList.push(accounts[index]);

        if(accounts[index += 1] == undefined) return callback(null, accountsList);

        return browseAccounts();
      });
    }

    browseAccounts();
  });
}

/****************************************************************************************************/

module.exports =
{
  retrieveMessengerData: retrieveMessengerData,
  retrieveConversationData: retrieveConversationData,
  getAccountsWithWhomToStartConversation: getAccountsWithWhomToStartConversation
}

/****************************************************************************************************/
