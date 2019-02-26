/****************************************************************************************************/

function displayOrHideMessengerBlock()
{
  if(document.getElementById('messengerBlockHidden') == null) return;

  if(document.getElementById('messengerBlockHidden').style.display === 'flex')
  {
    document.getElementById('messengerBlockHidden').removeAttribute('style');
  }

  else
  {
    document.getElementById('messengerBlockHidden').style.display = 'flex';

    if(document.getElementById('messengerConversationBlock'))
    {
      messengerData[document.getElementById('messengerConversationBlock').getAttribute('name')].counter = 0;

      var counter = 0;

      for(var conversation in messengerData) counter += messengerData[conversation].counter;

      document.getElementById('messengerHeaderCounter').innerText = `${commonStrings.messenger.headerCounter} : ${counter}`;

      $.ajax({ method: 'POST', timeout: 10000, dataType: 'JSON', data: { conversationUuid: document.getElementById('messengerConversationBlock').getAttribute('name'), hasBeenOpenned: true }, url: '/api/messenger/get-conversation-content' });
    }
  }
}

/****************************************************************************************************/
