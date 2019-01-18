'use strict'

const express               = require('express');
const errors                = require(`${__root}/json/errors`);
const success               = require(`${__root}/json/success`);
const constants             = require(`${__root}/functions/constants`);
const commonMessengerGet    = require(`${__root}/functions/common/messenger/get`);
const commonMessengerSend   = require(`${__root}/functions/common/messenger/send`);
const commonMessengerUpdate = require(`${__root}/functions/common/messenger/update`);

var router = express.Router();

/****************************************************************************************************/

router.get('/get-conversations', (req, res) =>
{
  const currentAccountData = req.app.locals.account;

  commonMessengerGet.getConversations(currentAccountData.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, conversations) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ accountData: currentAccountData, conversationsData: conversations });
  });
});

/****************************************************************************************************/

router.post('/get-conversation-content', (req, res) =>
{
  const currentAccountData = req.app.locals.account;

  if(req.body.conversationUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Conversation Uuid' });
  
  commonMessengerGet.getConversationData(req.body.conversationUuid, currentAccountData, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, conversationData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ accountData: currentAccountData, conversationData: conversationData });
  });
});

/****************************************************************************************************/

router.post('/post-message', (req, res) =>
{
  const currentAccountData = req.app.locals.account;

  if(req.body.messageData == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Message Data' });

  const messageData = JSON.parse(req.body.messageData);

  if(messageData.messageContent == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Message Content' });

  commonMessengerSend.addMessageToConversation(messageData.messageContent, messageData.conversationUuid, messageData.participants, currentAccountData.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, conversationUuid) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    req.app.get('io').in(messageData.conversationUuid).emit('messagePosted', messageData.conversationUuid);

    if(messageData.conversationUuid == null) req.app.get('io').in('messengerAwaitingNewConversations').emit('conversationStarted', conversationUuid);

    return res.status(200).send({ message: success[constants.MESSENGER_MESSAGE_SENT_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

router.get('/get-accounts-with-whom-to-start-a-conversation', (req, res) =>
{
  const currentAccountData = req.app.locals.account;

  commonMessengerGet.getAccountsWithWhomStartingAConversation(currentAccountData.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountsToReturn) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ accounts: accountsToReturn });
  });
});

/****************************************************************************************************/

module.exports = router;