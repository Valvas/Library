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

  messengerHeaderTitle    .innerText = commonStrings.messenger.headerTitle;
  messengerHeaderCounter  .innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;
  blockHeaderNew          .innerText = commonStrings.messenger.startNewConversation.title;
  homeEmptyAccounts       .innerText = commonStrings.messenger.emptyConversations;
  homeEmptySearch         .innerText = commonStrings.messenger.emptySearchResults;

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

    currentConversation       .setAttribute('class', 'messengerConversation');
    conversationPicture       .setAttribute('class', 'messengerConversationPicture');
    conversationResume        .setAttribute('class', 'messengerConversationResume');
    conversationReceiver      .setAttribute('class', 'messengerConversationResumeReceiver');
    conversationLast          .setAttribute('class', 'messengerConversationResumeLast');
    conversationCounter       .setAttribute('class', 'messengerConversationResumeCounter');

    conversationPicture       .innerHTML = `<img class="messengerConversationPictureContent" src="${messengerData[conversation].receiver.picture}" />`;

    conversationReceiver      .innerText = `${messengerData[conversation].receiver.firstname.charAt(0).toUpperCase()}${messengerData[conversation].receiver.firstname.slice(1).toLowerCase()} ${messengerData[conversation].receiver.lastname.charAt(0).toUpperCase()}${messengerData[conversation].receiver.lastname.slice(1).toLowerCase()}`;

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

  return callback(null);
}

/****************************************************************************************************/
