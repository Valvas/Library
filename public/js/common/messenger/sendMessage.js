/****************************************************************************************************/

const characters = '0123456789ABCDEF';

/****************************************************************************************************/

function sendMessage(event)
{
  event.preventDefault();

  const currentMessage = event.target.elements['message'].value.trim();

  if(currentMessage.length === 0) return;

  var messageIdentifier = '';

  for(var x = 0; x < 32; x++) messageIdentifier += characters.charAt(Math.floor(Math.random() * characters.length));

  var newMessageBlock = document.createElement('div');
  var blockContent    = document.createElement('div');

  newMessageBlock     .setAttribute('id', messageIdentifier);

  newMessageBlock     .setAttribute('class', 'messengerConversationBlockContentMessagesElementSender');
  blockContent        .setAttribute('class', 'messengerConversationBlockContentMessagesElementSenderBlock');

  blockContent        .innerHTML = `<div class="messengerConversationBlockContentMessagesElementSaving"><div class="messengerConversationBlockContentMessagesElementSavingContent">${currentMessage}</div><div class="messengerConversationBlockContentMessagesElementSavingSpinner"></div></div>`;

  newMessageBlock     .appendChild(blockContent);

  document.getElementById('messengerConversationBlockContentMessages').appendChild(newMessageBlock);

  document.getElementById('messengerConversationBlockContentMessages').scrollTop = document.getElementById('messengerConversationBlockContentMessages').scrollHeight;

  $.ajax(
  {
    method: 'POST', timeout: 10000, dataType: 'JSON', data: { conversationUuid: document.getElementById('messengerConversationBlock').getAttribute('name'), messageIdentifier: messageIdentifier, messageContent: currentMessage }, url: '/api/messenger/post-message', success: () => {},
    error: (xhr, status, error) =>
    {
      event.target.elements['message'].value = '';

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'postConversationMessage') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'postConversationMessage');

      newMessageBlock.removeAttribute('id');
      blockContent.innerHTML = `<div class="messengerConversationBlockContentMessagesElementFailed">${commonStrings.messenger.sendingFailed}</div><div>${currentMessage}</div>`;
    }

  }).done(() =>
  {
    event.target.elements['message'].value = '';
  });
}

/****************************************************************************************************/
