/****************************************************************************************************/

function createMessenger(callback)
{
  var counter = 0;

  for(var conversation in messengerData)
  {
    counter += messengerData[conversation].counter;
  }

  if(counter > 0) document.title = `${counter} ${commonStrings.messenger.titleMessage}`;

  var messenger               = document.createElement('div');
  var messengerHeader         = document.createElement('div');
  var messengerHeaderTitle    = document.createElement('div');
  var messengerHeaderCounter  = document.createElement('div');
  var messengerBlockHidden    = document.createElement('div');
  var messengerBlockHome      = document.createElement('div');
  var homeEmptyAccounts       = document.createElement('div');
  var homeEmptySearch         = document.createElement('div');
  var messengerBlockHeader    = document.createElement('div');
  var blockHeaderStatus       = document.createElement('select');
  var blockHeaderNew          = document.createElement('button');
  var blockHeaderSearch       = document.createElement('input');
  var messengerList           = document.createElement('div');

  messengerBlockHidden    .setAttribute('id', 'messengerBlockHidden');
  messengerList           .setAttribute('id', 'messengerConversationsList');
  messengerHeaderCounter  .setAttribute('id', 'messengerHeaderCounter');
  messengerBlockHome      .setAttribute('id', 'messengerBlockHome');
  homeEmptyAccounts       .setAttribute('id', 'messengerEmptyAccounts');
  homeEmptySearch         .setAttribute('id', 'messengerBlockEmptySearch');

  messenger               .setAttribute('class', 'messengerBlock');
  messengerHeader         .setAttribute('class', 'messengerHeader');
  messengerHeaderTitle    .setAttribute('class', 'messengerHeaderTitle');
  messengerHeaderCounter  .setAttribute('class', 'messengerHeaderCounter');
  messengerBlockHidden    .setAttribute('class', 'messengerBlockHidden');
  messengerBlockHeader    .setAttribute('class', 'messengerBlockHeader');
  homeEmptyAccounts       .setAttribute('class', 'messengerEmptyAccounts');
  homeEmptySearch         .setAttribute('class', 'messengerEmptySearch');
  messengerList           .setAttribute('class', 'messengerConversationsList');

  messengerHeader         .addEventListener('click', displayOrHideMessengerBlock);

  blockHeaderSearch       .setAttribute('placeholder', commonStrings.messenger.searchInputPlaceholder);

  blockHeaderNew          .addEventListener('click', createNewConversationOpenAccountsList);
  blockHeaderSearch       .addEventListener('input', searchForConversations);
  blockHeaderStatus       .addEventListener('change', updateMessengerStatus);

  messengerHeaderTitle    .innerText = commonStrings.messenger.headerTitle;
  messengerHeaderCounter  .innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;
  blockHeaderNew          .innerText = commonStrings.messenger.startNewConversation.title;
  homeEmptyAccounts       .innerText = commonStrings.messenger.emptyConversations;
  homeEmptySearch         .innerText = commonStrings.messenger.emptySearchResults;

  blockHeaderStatus       .innerHTML += `<option value="available">${commonStrings.messenger.status.available}</option>`;
  blockHeaderStatus       .innerHTML += `<option value="busy">${commonStrings.messenger.status.busy}</option>`;
  blockHeaderStatus       .innerHTML += `<option value="away">${commonStrings.messenger.status.away}</option>`;

  blockHeaderStatus       .value = getMessengerStatusFromCookie();

  if(Object.keys(messengerData).length === 0) homeEmptyAccounts.style.display = 'block';

  for(var conversation in messengerData)
  {
    const currentConversationUuid = conversation;

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
    conversationReceiver      .setAttribute('name', messengerData[conversation].receiver.uuid);

    currentConversation       .setAttribute('class', 'messengerConversation');
    conversationPicture       .setAttribute('class', 'messengerConversationPicture');
    conversationResume        .setAttribute('class', 'messengerConversationResume');
    conversationReceiver      .setAttribute('class', 'messengerConversationResumeReceiver');
    conversationLast          .setAttribute('class', 'messengerConversationResumeLast');
    conversationCounter       .setAttribute('class', 'messengerConversationResumeCounter');

    conversationPicture       .innerHTML = `<img class="messengerConversationPictureContent" src="${messengerData[conversation].receiver.picture}" alt="" />`;

    conversationReceiver      .innerHTML += `<div class="name">${messengerData[conversation].receiver.firstname.charAt(0).toUpperCase()}${messengerData[conversation].receiver.firstname.slice(1).toLowerCase()} ${messengerData[conversation].receiver.lastname.charAt(0).toUpperCase()}${messengerData[conversation].receiver.lastname.slice(1).toLowerCase()}</div>`;

    conversationReceiver      .innerHTML += `<span class="offline"></span>`;

    conversationLast          .innerHTML = messengerData[conversation].messages[0].author === accountData.uuid
    ? `${accountData.firstname.charAt(0).toUpperCase()}${accountData.firstname.slice(1).toLowerCase()} ${accountData.lastname.charAt(0).toUpperCase()}${accountData.lastname.slice(1).toLowerCase()} : ${messengerData[conversation].messages[0].content}`
    : `${messengerData[conversation].receiver.firstname.charAt(0).toUpperCase()}${messengerData[conversation].receiver.firstname.slice(1).toLowerCase()} ${messengerData[conversation].receiver.lastname.charAt(0).toUpperCase()}${messengerData[conversation].receiver.lastname.slice(1).toLowerCase()} : ${messengerData[conversation].messages[0].content}`;

    conversationCounter       .innerText = messengerData[conversation].counter === 0 ? '' : messengerData[conversation].counter;

    conversationResume        .appendChild(conversationReceiver);
    conversationResume        .appendChild(conversationLast);
    conversationResume        .appendChild(conversationCounter);
    currentConversation       .appendChild(conversationPicture);
    currentConversation       .appendChild(conversationResume);
    messengerList             .appendChild(currentConversation);
  }

  messengerHeader         .appendChild(messengerHeaderTitle);
  messengerHeader         .appendChild(messengerHeaderCounter);
  messengerBlockHeader    .appendChild(blockHeaderStatus);
  messengerBlockHeader    .appendChild(blockHeaderNew);
  messengerBlockHeader    .appendChild(blockHeaderSearch);
  messengerBlockHome      .appendChild(messengerBlockHeader);
  messengerBlockHome      .appendChild(homeEmptyAccounts);
  messengerBlockHome      .appendChild(homeEmptySearch);
  messengerBlockHome      .appendChild(messengerList);
  messengerBlockHidden    .appendChild(messengerBlockHome);
  messenger               .appendChild(messengerHeader);
  messenger               .appendChild(messengerBlockHidden);

  document.getElementById('mainContainer').appendChild(messenger);

  socket.emit('messengerAwaitingNewConversationsJoin');
  socket.emit('messengerJoin', accountData.uuid);

  switch(getMessengerStatusFromCookie())
  {
    case 'available':
      socket.emit('messengerSetStatusToAvailable');
      break;

    case 'busy':
      socket.emit('messengerSetStatusToBusy');
      break;

    case 'away':
      socket.emit('messengerSetStatusToAway');
      break;
  }

  updateReceiversStatus();

  setInterval(() =>
  {
    updateReceiversStatus();
  }, 2000);

  if('Notification' in window)
  {
    Notification.requestPermission();
  }

  return callback(null);
}

/****************************************************************************************************/

function updateReceiversStatus()
{
  let connectedUsers = [];

  socket.emit('getUsersStatusOnMessenger', (result) =>
  {
    connectedUsers = result;

    const currentConversations = document.getElementById('messengerConversationsList').children;

    for(let x = 0; x < currentConversations.length; x++)
    {
      const currentConversationReceiver = currentConversations[x].getElementsByClassName('messengerConversationResumeReceiver')[0].getAttribute('name');

      if(connectedUsers[currentConversationReceiver] === undefined)
      {
        currentConversations[x].getElementsByClassName('messengerConversationResumeReceiver')[0].children[1].setAttribute('class', 'offline');
      }

      else
      {
        switch(connectedUsers[currentConversationReceiver])
        {
          case 'available':
            currentConversations[x].getElementsByClassName('messengerConversationResumeReceiver')[0].children[1].setAttribute('class', 'online');
            break;

          case 'busy':
            currentConversations[x].getElementsByClassName('messengerConversationResumeReceiver')[0].children[1].setAttribute('class', 'busy');
            break;

          case 'away':
            currentConversations[x].getElementsByClassName('messengerConversationResumeReceiver')[0].children[1].setAttribute('class', 'away');
            break;
        }
      }
    }
  });
}

/****************************************************************************************************/
