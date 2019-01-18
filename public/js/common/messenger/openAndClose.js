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

  const conversations = document.getElementById('messengerConversationsContainer').children;

  for(var x = 0; x < conversations.length; x++) conversations[x].removeAttribute('style');

  $(document.getElementById('messengerHome')).slideUp(150, () =>
  {
    document.getElementById(conversationUuid).style.display = 'flex';

    $(document.getElementById('messengerConversationsContainer')).slideDown(150);
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