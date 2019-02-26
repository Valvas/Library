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

router.get('/get-messenger-data', (req, res) =>
{
  commonMessengerGet.retrieveMessengerData(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, messengerData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ messengerData: messengerData });
  });
});

/****************************************************************************************************/

router.post('/get-conversation-content', (req, res) =>
{
  if(req.body.conversationUuid == undefined) return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Conversation Uuid' });

  if(req.body.hasBeenOpenned !== 'true' && req.body.hasBeenOpenned !== 'false') return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Openned Conversation Status' });

  commonMessengerGet.retrieveConversationData(req.body.conversationUuid, req.body.hasBeenOpenned === 'true', req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, conversationData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send(conversationData);
  });
});

/****************************************************************************************************/

router.post('/post-message', (req, res) =>
{
  if(req.body.messageContent == undefined)            return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Message Content' });
  if(req.body.conversationUuid == undefined)          return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Conversation Uuid' });
  if(req.body.messageIdentifier == undefined)         return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Message Identifier' });

  const accountData = req.app.locals.account;

  commonMessengerSend.addMessageToConversation(req.body.messageContent, req.body.conversationUuid, accountData.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, messageData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    messageData.identifier = req.body.messageIdentifier;
    messageData.author = `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()}`;

    req.app.get('io').in(req.body.conversationUuid).emit('messagePosted', messageData);

    return res.status(200).send({  });
  });
});

/****************************************************************************************************/

router.get('/get-accounts-with-whom-to-start-a-conversation', (req, res) =>
{
  commonMessengerGet.getAccountsWithWhomToStartConversation(req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, accountsList) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    return res.status(200).send({ accountsList: accountsList });
  });
});

/****************************************************************************************************/

router.post('/create-conversation', (req, res) =>
{
  if(req.body.receiverUuid == undefined)    return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Receiver Uuid' });
  if(req.body.messageContent == undefined)  return res.status(406).send({ message: errors[constants.MISSING_DATA_IN_REQUEST], detail: 'Message Content' });

  const accountData = req.app.locals.account;

  commonMessengerSend.createConversation(req.body.messageContent, req.body.receiverUuid, req.app.locals.account.uuid, req.app.get('databaseConnectionPool'), req.app.get('params'), (error, conversationData) =>
  {
    if(error != null) return res.status(error.status).send({ message: errors[error.code], detail: error.detail });

    conversationData.sender = accountData;

    req.app.get('io').in('messengerAwaitingNewConversations').emit('conversationCreated', conversationData);

    return res.status(200).send({ message: success[constants.MESSENGER_MESSAGE_SENT_SUCCESSFULLY] });
  });
});

/****************************************************************************************************/

module.exports = router;
