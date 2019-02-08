/****************************************************************************************************/

function createMessenger(callback)
{
  var counter = 0;

  for(var conversation in messengerData)
  {
    counter += messengerData[conversation].counter;
  }

  var messenger               = document.createElement('div');
  var messengerHeader         = document.createElement('div');
  var messengerHeaderTitle    = document.createElement('div');
  var messengerHeaderCounter  = document.createElement('div');
  var messengerBlockHidden    = document.createElement('div');
  var messengerList           = document.createElement('div');

  messenger               .setAttribute('class', 'messengerBlock');
  messengerHeader         .setAttribute('class', 'messengerHeader');
  messengerHeaderTitle    .setAttribute('class', 'messengerHeaderTitle');
  messengerHeaderCounter  .setAttribute('class', 'messengerHeaderCounter');
  messengerBlockHidden    .setAttribute('class', 'messengerBlockHidden');
  messengerList           .setAttribute('class', 'messengerConversationsList');

  messengerHeaderTitle    .innerText = commonStrings.messenger.headerTitle;
  messengerHeaderCounter  .innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;

  for(var conversation in messengerData)
  {
    var currentConversation   = document.createElement('div');
    var conversationPicture   = document.createElement('div');
    var conversationResume    = document.createElement('div');
    var conversationReceiver  = document.createElement('div');
    var conversationLast      = document.createElement('div');
    var conversationCounter   = document.createElement('div');

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

    conversationCounter       .innerText = messengerData[conversation].counter;

    conversationResume        .appendChild(conversationReceiver);
    conversationResume        .appendChild(conversationLast);
    conversationResume        .appendChild(conversationCounter);
    currentConversation       .appendChild(conversationPicture);
    currentConversation       .appendChild(conversationResume);
    messengerList             .appendChild(currentConversation);
  }

  messengerHeader         .appendChild(messengerHeaderTitle);
  messengerHeader         .appendChild(messengerHeaderCounter);
  messengerBlockHidden    .appendChild(messengerList);
  messenger               .appendChild(messengerHeader);
  messenger               .appendChild(messengerBlockHidden);

  //document.getElementById('mainContainer').appendChild(messenger);

  return callback(null);
}

/****************************************************************************************************/
