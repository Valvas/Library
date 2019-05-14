/****************************************************************************************************/

let conversationStatusInterval = null;

/****************************************************************************************************/

function openConversation(conversationUuid)
{
  document.getElementById('messengerBlockHome').style.display = 'none';

  const loader  = document.createElement('div');

  loader      .setAttribute('class', 'messengerLoaderVerticalContainer');
  loader      .innerHTML = '<div class="messengerLoaderHorizontalContainer"><div class="messengerLoaderSpinner"></div></div>';

  document.getElementById('messengerBlockHidden').appendChild(loader);

  $.ajax(
  {
    method: 'POST', timeout: 10000, dataType: 'JSON', data: { conversationUuid: conversationUuid, hasBeenOpenned: true }, url: '/api/messenger/get-conversation-content', success: () => {},
    error: (xhr, status, error) =>
    {
      loader.remove();

      document.getElementById('messengerBlockHome').removeAttribute('style');

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'openConversationError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'openConversationError');
    }

  }).done((conversationData) =>
  {
    messengerData[conversationUuid].counter = 0;

    let counter = 0;

    for(let conversation in messengerData) counter += messengerData[conversation].counter;

    document.getElementById('messengerHeaderCounter').innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;

    document.title = counter === 0 ? pageTitle : `${counter} ${commonStrings.messenger.titleMessage}`;

    const conversationsList = document.getElementById('messengerConversationsList').children;

    for(let x = 0; x < conversationsList.length; x++)
    {
      if(conversationsList[x].getAttribute('name') !== conversationUuid) continue;

      conversationsList[x].children[1].children[2].innerText = '';
    }

    const conversation          = document.createElement('div');
    const conversationHeader    = document.createElement('div');
    const headerUpperBlock      = document.createElement('div');
    const headerReturn          = document.createElement('button');
    const headerReceiver        = document.createElement('div');
    const receiverPicture       = document.createElement('div');
    const receiverName          = document.createElement('div');
    const receiverStatus        = document.createElement('span');
    const conversationContent   = document.createElement('div');
    const contentMessages       = document.createElement('div');
    const contentSender         = document.createElement('form');
    const senderTools           = document.createElement('div');
    const senderInput           = document.createElement('textarea');
    const senderButton          = document.createElement('button');

    conversation              .setAttribute('class', 'messengerConversationBlock');
    conversationHeader        .setAttribute('class', 'messengerConversationBlockHeader');
    headerUpperBlock          .setAttribute('class', 'messengerConversationBlockHeaderUpper');
    headerReceiver            .setAttribute('class', 'messengerConversationBlockHeaderReceiver');
    receiverPicture           .setAttribute('class', 'messengerConversationBlockHeaderReceiverPicture');
    receiverName              .setAttribute('class', 'messengerConversationBlockHeaderReceiverName');
    receiverStatus            .setAttribute('class', 'offline');
    headerReturn              .setAttribute('class', 'messengerConversationBlockHeaderUpperReturn');
    contentSender             .setAttribute('class', 'messengerConversationBlockContentSender');
    senderTools               .setAttribute('class', 'messengerConversationBlockContentSenderTools');
    senderInput               .setAttribute('class', 'messengerConversationBlockContentSenderInput');
    senderButton              .setAttribute('class', 'messengerConversationBlockContentSenderButton');
    conversationContent       .setAttribute('class', 'messengerConversationBlockContent');
    contentMessages           .setAttribute('class', 'messengerConversationBlockContentMessages');

    conversation              .setAttribute('id', 'messengerConversationBlock');
    contentMessages           .setAttribute('id', 'messengerConversationBlockContentMessages');

    conversation              .setAttribute('name', conversationUuid);

    senderInput               .setAttribute('placeholder', commonStrings.messenger.conversationBlock.textareaPlaceholder);

    senderInput               .setAttribute('name', 'message');

    headerUpperBlock          .innerHTML += `<div class="messengerConversationBlockHeaderUpperLabel">${commonStrings.messenger.conversationBlock.headerLabel} :</div>`;
    receiverPicture           .innerHTML += `<img src="${conversationData.receiver.picture}" alt="" />`;
    senderTools               .innerHTML += `<span onclick="messengerPickEmoji()">&#x1F642;</span>`;

    headerReturn              .innerText = commonStrings.messenger.conversationBlock.headerReturn;
    receiverName              .innerText = `${conversationData.receiver.firstname.charAt(0).toUpperCase()}${conversationData.receiver.firstname.slice(1).toLowerCase()} ${conversationData.receiver.lastname.charAt(0).toUpperCase()}${conversationData.receiver.lastname.slice(1).toLowerCase()}`;
    senderButton              .innerText = commonStrings.messenger.conversationBlock.sendButton;

    contentSender             .addEventListener('submit', sendMessage);

    const messages = conversationData.messages.reverse();

    for(let x = 0; x < messages.length; x++)
    {
      const currentMessage      = document.createElement('div');

      currentMessage          .setAttribute('name', messages[x].timestamp);

      messages[x].author === accountData.uuid
      ? currentMessage        .setAttribute('class', 'messengerConversationBlockContentMessagesElementSender')
      : currentMessage        .setAttribute('class', 'messengerConversationBlockContentMessagesElementReceiver');

      contentMessages         .appendChild(currentMessage);

      currentMessage.innerHTML += messages[x].author === accountData.uuid
      ? `<div class="messengerConversationBlockContentMessagesElementSenderBlock"><div class="messengerConversationBlockContentMessagesElementDate">${messages[x].date}</div><div>${messages[x].content}</div></div>`
      : `<div class="messengerConversationBlockContentMessagesElementReceiverBlock"><div class="messengerConversationBlockContentMessagesElementDate">${messages[x].date}</div><div>${messages[x].content}</div></div>`;
    }

    headerReturn              .addEventListener('click', () =>
    {
      if(conversationStatusInterval !== null)
      {
        clearInterval(conversationStatusInterval);
      }

      conversation.remove();
      document.getElementById('messengerBlockHome').removeAttribute('style');
    });

    conversationHeader        .appendChild(headerUpperBlock);
    conversationHeader        .appendChild(headerReceiver);
    headerUpperBlock          .appendChild(headerReturn);
    headerReceiver            .appendChild(receiverPicture);
    headerReceiver            .appendChild(receiverName);
    headerReceiver            .appendChild(receiverStatus);
    //contentSender             .appendChild(senderTools);
    contentSender             .appendChild(senderInput);
    contentSender             .appendChild(senderButton);
    conversationContent       .appendChild(contentMessages);
    conversationContent       .appendChild(contentSender);
    conversation              .appendChild(conversationHeader);
    conversation              .appendChild(conversationContent);

    loader                    .remove();

    document.getElementById('messengerBlockHidden').appendChild(conversation);

    const checkCurrentReceiverStatus = () =>
    {
      socket.emit('getUsersStatusOnMessenger', (connectedUsers) =>
      {
        connectedUsers[conversationData.receiver.uuid]
        ? receiverStatus.setAttribute('class', 'online')
        : receiverStatus.setAttribute('class', 'offline');

        if(connectedUsers[conversationData.receiver.uuid] === undefined)
        {
          receiverStatus.setAttribute('class', 'offline');
        }

        else
        {
          switch(connectedUsers[conversationData.receiver.uuid])
          {
            case 'available':
              receiverStatus.setAttribute('class', 'online');
              break;

            case 'busy':
              receiverStatus.setAttribute('class', 'busy');
              break;

            case 'away':
              receiverStatus.setAttribute('class', 'away');
              break;
          }
        }
      });
    }

    checkCurrentReceiverStatus();

    conversationStatusInterval = setInterval(() =>
    {
      checkCurrentReceiverStatus();
    }, 2000);

    contentMessages.scrollTop = contentMessages.scrollHeight;
  });
}

/****************************************************************************************************/
