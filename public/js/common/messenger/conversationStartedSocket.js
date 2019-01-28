/****************************************************************************************************/

socket.on('conversationStarted', (conversationUuid) =>
{
  $.ajax(
  {
    method: 'POST', dataType: 'json', data: { conversationUuid: conversationUuid }, timeout: 10000, url: '/api/messenger/get-conversation-content',

    error: (xhr, textStatus, errorThrown) =>
    {
      
    }

  }).done((result) =>
  {
    const accountData = result.accountData;
    const conversationData = result.conversationData;

    if(document.getElementById('messengerHome') == null) return;
    if(document.getElementById('messengerConversationsContainer') == null) return;

    if(document.getElementById('unreadMessagesCounter') && accountData.uuid !== conversationData.conversationMessages[0].authorUuid) document.getElementById('unreadMessagesCounter').innerText = parseInt(document.getElementById('unreadMessagesCounter').innerText) + 1;

    var receiver = null;

    for(var participant in conversationData.conversationParticipants)
    {
      if(conversationData.conversationParticipants[participant].accountUuid === accountData.uuid) continue;

      receiver = conversationData.conversationParticipants[participant];

      break;
    }

    if(receiver == null) return;


    const currentConversations = document.getElementById('messengerHome').getElementsByTagName('ul')[0].children;

    var conversationAlreadyExists = false;

    for(var x = 0; x < currentConversations; x++)
    {
      if(currentConversations[x].getAttribute('name') === conversationData.conversationUuid) conversationAlreadyExists = true;
    }

    if(conversationAlreadyExists) return;

    var newConversationBlock  = document.createElement('li');

    newConversationBlock      .setAttribute('class', 'messengerHomeListElement');
    newConversationBlock      .setAttribute('onclick', `openConversation('${conversationData.conversationUuid}')`);
    newConversationBlock      .setAttribute('name', conversationData.conversationUuid);

    newConversationBlock      .innerHTML += `<div class="messengerHomeListElementPicture"><div class="messengerHomeListElementPictureCircle"><img class="messengerHomeListElementPictureContent" src="${receiver.accountPicture}" /></div></div>`;
    newConversationBlock      .innerHTML += `<div class="messengerHomeListElementAside"><div class="messengerHomeListElementAsideReceiver">${receiver.accountFirstname.charAt(0).toUpperCase()}${receiver.accountFirstname.slice(1).toLowerCase()} ${receiver.accountLastname.charAt(0).toUpperCase()}${receiver.accountLastname.slice(1).toLowerCase()}</div><div class="messengerHomeListElementAsidePreview">${conversationData.conversationMessages[conversationData.conversationMessages.length - 1].authorName} : ${conversationData.conversationMessages[conversationData.conversationMessages.length - 1].messageContent}</div></div>`;
    
    if(accountData.uuid !== conversationData.conversationMessages[0].authorUuid) newConversationBlock.innerHTML += `<div class="messengerHomeListElementCounter">1</div>`;

    document.getElementById('messengerHome').children[2].insertBefore(newConversationBlock, document.getElementById('messengerHome').getElementsByTagName('ul')[0].children[0]);
  
    if(document.getElementById(conversationUuid)) return;
    
    var newConversationContent  = document.createElement('div');
    var newConversationHeader   = document.createElement('div');
    var newConversationReceiver = document.createElement('div');
    var newConversationList     = document.createElement('ul');
    var newConversationForm     = document.createElement('form');
    var newConversationSender   = document.createElement('div');

    newConversationContent      .setAttribute('id', conversationData.conversationUuid);
    newConversationForm         .setAttribute('name', conversationData.conversationUuid);

    newConversationForm         .addEventListener('submit', sendMessageToServer);

    newConversationContent      .setAttribute('class', 'messengerConversation');
    newConversationHeader       .setAttribute('class', 'messengerConversationHeader');
    newConversationReceiver     .setAttribute('class', 'messengerConversationHeaderReceiver');
    newConversationList         .setAttribute('class', 'messengerConversationList');
    newConversationForm         .setAttribute('class', 'messengerConversationActions');
    newConversationSender       .setAttribute('class', 'messengerConversationActionsSender');

    newConversationHeader       .innerHTML += `<button class="messengerConversationHeaderReturn" onclick="closeConversation('${conversationData.conversationUuid}')">${commonStrings.messenger.returnButton}</button>`;
    newConversationReceiver     .innerHTML += `<div class="messengerConversationHeaderReceiverCircle"><img class="messengerConversationHeaderReceiverPicture" src="${receiver.accountPicture}" /></div>`;
    newConversationReceiver     .innerHTML += `<div class="messengerConversationHeaderReceiverName">${receiver.accountFirstname.charAt(0).toUpperCase()}${receiver.accountFirstname.slice(1).toLowerCase()} ${receiver.accountLastname.charAt(0).toUpperCase()}${receiver.accountLastname.slice(1).toLowerCase()}</div>`;

    newConversationHeader       .appendChild(newConversationReceiver);

    for(var x = 0; x < conversationData.conversationMessages.length; x++)
    {
      var currentMessage    = document.createElement('li');

      currentMessage        .setAttribute('class', 'messengerConversationListMessage');
      currentMessage        .setAttribute('name', conversationData.conversationMessages[x].messageId);

      currentMessage        .innerHTML += conversationData.conversationMessages[x].authorUuid === receiver.accountUuid
      ? `<div class="messengerConversationListMessageLeft"><div class="messengerConversationListMessageDate">${conversationData.conversationMessages[x].messageDate}</div><div>${conversationData.conversationMessages[x].messageContent}</div></div>`
      : `<div class="messengerConversationListMessageRight"><div class="messengerConversationListMessageDate">${conversationData.conversationMessages[x].messageDate}</div><div>${conversationData.conversationMessages[x].messageContent}</div></div>`;

      newConversationList   .appendChild(currentMessage);
    }

    newConversationForm         .innerHTML += `<textarea name="message" class="messengerConversationActionsInput" placeholder="${commonStrings.messenger.conversationBlock.textareaPlaceholder}"></textarea>`;
    newConversationForm         .innerHTML += `<div class="messengerConversationActionsEmpty">${commonStrings.messenger.conversationBlock.emptyMessage}</div>`;

    newConversationSender       .innerHTML += `<button class="messengerConversationActionsSenderButton">${commonStrings.messenger.conversationBlock.sendButton}</button>`;
    newConversationSender       .innerHTML += `<div class="messengerConversationActionsLoader"><i class="fas fa-cog fa-spin"></i></div>`;

    newConversationForm         .appendChild(newConversationSender);

    newConversationContent      .appendChild(newConversationHeader);
    newConversationContent      .appendChild(newConversationList);
    newConversationContent      .appendChild(newConversationForm);

    document.getElementById('messengerConversationsContainer').appendChild(newConversationContent);

    socket.emit('messengerJoinConversation', conversationData.conversationUuid);
  });
});

/****************************************************************************************************/