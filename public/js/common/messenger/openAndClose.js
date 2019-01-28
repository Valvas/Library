/****************************************************************************************************/
/* Display The Messenger Container */
/****************************************************************************************************/

function displayMessengerBlock()
{
  if(document.getElementById('messengerHidden') == null) return;
  if(document.getElementById('messengerSectionHeader') == null) return;

  document.getElementById('messengerSectionHeader').setAttribute('onclick', 'hideMessengerBlock()');

  $(document.getElementById('messengerHidden')).slideDown(250);
}

/****************************************************************************************************/
/* Hide The Messenger Container */
/****************************************************************************************************/

function hideMessengerBlock()
{
  if(document.getElementById('messengerHidden') == null) return;
  if(document.getElementById('messengerSectionHeader') == null) return;

  document.getElementById('messengerSectionHeader').setAttribute('onclick', 'displayMessengerBlock()');

  $(document.getElementById('messengerHidden')).slideUp(250);
}

/****************************************************************************************************/
/* Open A Conversation */
/****************************************************************************************************/

function openConversation(conversationUuid)
{
  if(document.getElementById('messengerHome') == null) return;
  if(document.getElementById(conversationUuid) == null) return;
  if(document.getElementById('messengerConversationsContainer') == null) return;

  $.ajax(
  {
    method: 'POST', dataType: 'json', data: { conversationUuid: conversationUuid }, timeout: 10000, url: '/api/messenger/conversation-opened',

    error: (xhr, textStatus, errorThrown) => {  }

  }).done((result) => {  });

  const conversations = document.getElementById('messengerConversationsContainer').children;

  const conversationHeaders = document.getElementById('messengerHome').children[2].children;

  for(var x = 0; x < conversationHeaders.length; x++)
  {
    if(conversationHeaders[x].getAttribute('name') !== conversationUuid) continue;

    if(conversationHeaders[x].children[2] == undefined) break;

    const amountOfUnreadMessagesForThisConversation = parseInt(conversationHeaders[x].children[2].innerText);

    conversationHeaders[x].children[2].remove();

    if(document.getElementById('unreadMessagesCounter') == undefined) break;

    const totalAmountOfUnreadMessages = parseInt(document.getElementById('unreadMessagesCounter').innerText);

    const newTotalAmountOfUnreadMessages = (totalAmountOfUnreadMessages - amountOfUnreadMessagesForThisConversation) < 0 ? 0 : (totalAmountOfUnreadMessages - amountOfUnreadMessagesForThisConversation);

    document.getElementById('unreadMessagesCounter').innerText = newTotalAmountOfUnreadMessages;
  }

  for(var x = 0; x < conversations.length; x++) conversations[x].removeAttribute('style');

  $(document.getElementById('messengerHome')).slideUp(150, () =>
  {
    document.getElementById(conversationUuid).style.display = 'flex';

    $(document.getElementById('messengerConversationsContainer')).slideDown(150);

    document.getElementById(conversationUuid).children[1].scrollTop = document.getElementById(conversationUuid).children[1].scrollHeight;
  });
}

/****************************************************************************************************/
/* Close A Conversation */
/****************************************************************************************************/

function closeConversation(conversationUuid)
{
  if(document.getElementById('messengerHome') == null) return;
  if(document.getElementById(conversationUuid) == null) return;
  if(document.getElementById('messengerConversationsContainer') == null) return;

  $(document.getElementById('messengerConversationsContainer')).slideUp(150, () =>
  {
    document.getElementById(conversationUuid).removeAttribute('style');

    $(document.getElementById('messengerHome')).slideDown(150);
  });
}

/****************************************************************************************************/