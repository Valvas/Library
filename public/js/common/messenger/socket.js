/****************************************************************************************************/
/* SOCKET : Message Posted */
/****************************************************************************************************/

socket.on('messagePosted', (conversationUuid) =>
{
  if(document.getElementById('messengerConversationsContainer') == null) return;

  $.ajax(
  {
    method: 'POST', dataType: 'json', data: { conversationUuid: conversationUuid }, timeout: 10000, url: '/api/messenger/get-conversation-content',

    error: (xhr, textStatus, errorThrown) =>
    {
      xhr.responseJSON != undefined
      ? displayMessengerError(xhr.responseJSON.message, true)
      : displayMessengerError(commonStrings.messenger.genericErrorMessage, true);
    }

  }).done((result) =>
  {
    const conversationMessages = result.conversationData.conversationMessages;

    const conversations = document.getElementById('messengerConversationsContainer').children;

    var currentConversation = null;

    for(var x = 0; x < conversations.length; x++)
    {
      if(conversations[x].getAttribute('id') === conversationUuid) currentConversation = conversations[x];
    }

    currentConversation.children[1].innerHTML = '';

    var lastMessage = null;

    for(var x = 0; x < conversationMessages.length; x++)
    {
      var currentMessage  = document.createElement('li');

      currentMessage      .setAttribute('name', conversationMessages[x].messageId);
      currentMessage      .setAttribute('class', 'messengerConversationListMessage');

      currentMessage      .innerHTML = conversationMessages[x].authorUuid === result.accountData.uuid
      ? `<div class="messengerConversationListMessageRight"><div class="messengerConversationListMessageDate">${conversationMessages[x].messageDate}</div><div>${conversationMessages[x].messageContent}</div></div>`
      : `<div class="messengerConversationListMessageLeft"><div class="messengerConversationListMessageDate">${conversationMessages[x].messageDate}</div><div>${conversationMessages[x].messageContent}</div></div>`;

      currentConversation.children[1].appendChild(currentMessage);

      if((x + 1) === conversationMessages.length) lastMessage = `<div class="messengerHomeListElementAsidePreview">${conversationMessages[x].authorName} : ${conversationMessages[x].messageContent}</div>`;
    }

    currentConversation.children[1].children[currentConversation.children[1].children.length - 1].scrollIntoView({ behavior: 'instant' });

    if(document.getElementById('messengerHome') == null) return;

    const conversationsList = document.getElementById('messengerHome').children[1].children;

    for(var x = 0; x < conversationsList.length; x++)
    {
      if(conversationsList[x].getAttribute('name') !== conversationUuid) continue;

      conversationsList[x].children[1].children[1].remove();
      conversationsList[x].children[1].innerHTML += lastMessage;
    }
  });
});

/****************************************************************************************************/
