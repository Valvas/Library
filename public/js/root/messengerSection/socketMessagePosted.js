/****************************************************************************************************/

socket.on('messagePosted', (messageData) =>
{
  if(messageData.authorUuid === accountData.uuid) return handleSenderProcess(messageData);

  return handleReceiverProcess(messageData);
});

/****************************************************************************************************/

function handleSenderProcess(messageData)
{
  if(document.getElementById('messengerConversationBlock') == null) return;
  if(document.getElementById('messengerConversationBlockContentMessages') == null) return;

  if(document.getElementById(messageData.identifier)) document.getElementById(messageData.identifier).remove();

  return appendNewMessageToTheList(messageData);
}

/****************************************************************************************************/

function handleReceiverProcess(messageData)
{
  if(document.getElementById('messengerBlockHidden').style.display === 'flex')
  {
    if(document.getElementById('messengerConversationBlock') && document.getElementById('messengerConversationBlock').getAttribute('name') === messageData.conversation)
    {
      $.ajax({ method: 'POST', timeout: 10000, dataType: 'JSON', data: { conversationUuid: messageData.conversation, hasBeenOpenned: true }, url: '/api/messenger/get-conversation-content' });

      return appendNewMessageToTheList(messageData);
    }

    else
    {
      messengerData[messageData.conversation].counter += 1;

      var counter = 0;

      for(var conversation in messengerData) counter += messengerData[conversation].counter;

      document.getElementById('messengerHeaderCounter').innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;

      document.title = counter === 0 ? pageTitle : `${counter} ${commonStrings.messenger.titleMessage}`;

      const conversationsList = document.getElementById('messengerConversationsList').children;

      for(var x = 0; x < conversationsList.length; x++)
      {
        if(conversationsList[x].getAttribute('name') !== messageData.conversation) continue;

        conversationsList[x].children[1].children[1].innerText = `${messageData.author} : ${messageData.content}`;

        conversationsList[x].children[1].children[2].innerText = conversationsList[x].children[1].children[2].innerText.length > 0
        ? `${parseInt(conversationsList[x].children[1].children[2].innerText) + 1}`
        : '1';
      }
    }
  }

  else
  {
    if(document.getElementById('messengerConversationBlock') && document.getElementById('messengerConversationBlock').getAttribute('name') === messageData.conversation)
    {
      messengerData[messageData.conversation].counter += 1;

      var counter = 0;

      for(var conversation in messengerData) counter += messengerData[conversation].counter;

      document.getElementById('messengerHeaderCounter').innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;

      document.title = counter === 0 ? pageTitle : `${counter} ${commonStrings.messenger.titleMessage}`;

      return appendNewMessageToTheList(messageData);
    }

    else
    {
      messengerData[messageData.conversation].counter += 1;

      var counter = 0;

      for(var conversation in messengerData) counter += messengerData[conversation].counter;

      document.getElementById('messengerHeaderCounter').innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;

      document.title = counter === 0 ? pageTitle : `${counter} ${commonStrings.messenger.titleMessage}`;

      const conversationsList = document.getElementById('messengerConversationsList').children;

      for(var x = 0; x < conversationsList.length; x++)
      {
        if(conversationsList[x].getAttribute('name') !== messageData.conversation) continue;

        conversationsList[x].children[1].children[1].innerText = `${messageData.author} : ${messageData.content}`;

        conversationsList[x].children[1].children[2].innerText = conversationsList[x].children[1].children[2].innerText.length > 0
        ? `${parseInt(conversationsList[x].children[1].children[2].innerText) + 1}`
        : '1';
      }
    }
  }
}

/****************************************************************************************************/

function appendNewMessageToTheList(messageData)
{
  const currentMessages = document.getElementById('messengerConversationBlockContentMessages').children;

  var index = 0;

  for(var x = 0; x < currentMessages.length; x++)
  {
    if(currentMessages[x].hasAttribute('name') == false) break;

    if(parseInt(currentMessages[x].getAttribute('name')) > parseInt(messageData.timestamp)) break;

    index += 1;
  }

  var newMessageBlock = document.createElement('div');
  var blockContent    = document.createElement('div');

  newMessageBlock     .setAttribute('name', messageData.timestamp);

  messageData.authorUuid === accountData.uuid
  ? newMessageBlock   .setAttribute('class', 'messengerConversationBlockContentMessagesElementSender')
  : newMessageBlock   .setAttribute('class', 'messengerConversationBlockContentMessagesElementReceiver');

  messageData.authorUuid === accountData.uuid
  ? blockContent      .setAttribute('class', 'messengerConversationBlockContentMessagesElementSenderBlock')
  : blockContent      .setAttribute('class', 'messengerConversationBlockContentMessagesElementReceiverBlock');

  blockContent        .innerHTML += `<div class="messengerConversationBlockContentMessagesElementDate">${messageData.date}</div>`;
  blockContent        .innerHTML += `<div>${messageData.content}</div>`;

  newMessageBlock     .appendChild(blockContent);

  document.getElementById('messengerConversationBlockContentMessages').insertBefore(newMessageBlock, document.getElementById('messengerConversationBlockContentMessages').children[index]);

  document.getElementById('messengerConversationBlockContentMessages').scrollTop = document.getElementById('messengerConversationBlockContentMessages').scrollHeight;
}

/****************************************************************************************************/
