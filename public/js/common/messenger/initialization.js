/****************************************************************************************************/

var commonStrings = null;

if(document.getElementById('messengerSection'))
{
  getCommonStrings((error, strings) =>
  {
    if(error != null) return displayMessengerError(error.message, false);

    commonStrings = strings;
  });
}

//displayMessengerError('This functionnality is disabled for the moment. Forthcoming in a next update', false);

/****************************************************************************************************/

var socket = io();

socket.on('connect', () =>
{
  socket.emit('messengerAwaitingNewConversationsJoin');

  const conversations = document.getElementById('messengerConversationsContainer').children;

  for(var x = 0; x < conversations.length; x++) socket.emit('messengerJoinConversation', conversations[x].getAttribute('id'));
});

/****************************************************************************************************/