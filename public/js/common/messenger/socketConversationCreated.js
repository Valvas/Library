/****************************************************************************************************/

socket.on('conversationCreated', (conversationData) =>
{
  if(conversationData.sender.uuid !== accountData.uuid && conversationData.receiver.uuid !== accountData.uuid) return;

  messengerData[conversationData.uuid] = {};
  messengerData[conversationData.uuid]['counter'] = conversationData.sender.uuid === accountData.uuid ? 0 : 1;
  messengerData[conversationData.uuid]['messages'] = [];
  messengerData[conversationData.uuid]['messages'].push({ author: conversationData.message.authorUuid, content: conversationData.message.content, date: conversationData.message.date, timestamp: conversationData.message.timestamp });
  messengerData[conversationData.uuid]['receiver'] = { email: conversationData.receiver.email, firstname: conversationData.receiver.firstname, lastname: conversationData.receiver.lastname, picture: conversationData.receiver.picture };

  const currentConversationUuid = conversationData.uuid;

  socket.emit('messengerJoinConversation', currentConversationUuid);

  var currentConversation   = document.createElement('div');
  var conversationPicture   = document.createElement('div');
  var conversationResume    = document.createElement('div');
  var conversationReceiver  = document.createElement('div');
  var conversationLast      = document.createElement('div');
  var conversationCounter   = document.createElement('div');

  currentConversation       .addEventListener('click', () =>
  {
    openConversation(currentConversationUuid);
  });

  currentConversation       .setAttribute('name', currentConversationUuid);

  currentConversation       .setAttribute('class', 'messengerConversation');
  conversationPicture       .setAttribute('class', 'messengerConversationPicture');
  conversationResume        .setAttribute('class', 'messengerConversationResume');
  conversationReceiver      .setAttribute('class', 'messengerConversationResumeReceiver');
  conversationLast          .setAttribute('class', 'messengerConversationResumeLast');
  conversationCounter       .setAttribute('class', 'messengerConversationResumeCounter');

  conversationPicture       .innerHTML = accountData.uuid === conversationData.sender.uuid
  ? `<img class="messengerConversationPictureContent" src="${messengerData[currentConversationUuid].receiver.picture}" alt="" />`
  : `<img class="messengerConversationPictureContent" src="${conversationData.sender.picture}" alt="" />`;

  conversationReceiver      .innerText = conversationData.sender.uuid === accountData.uuid
  ? `${conversationData.receiver.firstname.charAt(0).toUpperCase()}${conversationData.receiver.firstname.slice(1).toLowerCase()} ${conversationData.receiver.lastname.charAt(0).toUpperCase()}${conversationData.receiver.lastname.slice(1).toLowerCase()}`
  : `${conversationData.sender.firstname.charAt(0).toUpperCase()}${conversationData.sender.firstname.slice(1).toLowerCase()} ${conversationData.sender.lastname.charAt(0).toUpperCase()}${conversationData.sender.lastname.slice(1).toLowerCase()}`;

  conversationLast          .innerHTML = messengerData[currentConversationUuid].messages[0].author === conversationData.receiver.uuid
  ? `${conversationData.receiver.firstname.charAt(0).toUpperCase()}${conversationData.receiver.firstname.slice(1).toLowerCase()} ${conversationData.receiver.lastname.charAt(0).toUpperCase()}${conversationData.receiver.lastname.slice(1).toLowerCase()} : ${messengerData[currentConversationUuid].messages[0].content}`
  : `${conversationData.sender.firstname.charAt(0).toUpperCase()}${conversationData.sender.firstname.slice(1).toLowerCase()} ${conversationData.sender.lastname.charAt(0).toUpperCase()}${conversationData.sender.lastname.slice(1).toLowerCase()} : ${messengerData[currentConversationUuid].messages[0].content}`;

  conversationCounter       .innerText = messengerData[currentConversationUuid].counter === 0 ? '' : messengerData[currentConversationUuid].counter;

  conversationResume        .appendChild(conversationReceiver);
  conversationResume        .appendChild(conversationLast);
  conversationResume        .appendChild(conversationCounter);
  currentConversation       .appendChild(conversationPicture);
  currentConversation       .appendChild(conversationResume);

  var counter = 0;

  for(var conversation in messengerData) counter += messengerData[conversation].counter;

  document.getElementById('messengerHeaderCounter').innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;

  document.title = counter === 0 ? pageTitle : `${counter} ${commonStrings.messenger.titleMessage}`;

  document.getElementById('messengerEmptyAccounts').removeAttribute('style');

  document.getElementById('messengerConversationsList').appendChild(currentConversation);
});

/****************************************************************************************************/
