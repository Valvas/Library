/****************************************************************************************************/
/* Send Message From Existing Conversation To Server */
/****************************************************************************************************/

function sendMessageToServer()
{
  event.preventDefault();

  const input = event.target.elements['message'];

  event.target.children[1].removeAttribute('style');

  const message = input.value.trim().replace(/\s\s+/g, ' ');

  const conversationUuid = event.target.getAttribute('name');

  const submitButton = event.target.children[2].children[0];
  const submitLoader = event.target.children[2].children[1];

  if(message.length === 0) return event.target.children[1].style.display = 'block';

  submitButton.style.display = 'none';
  submitLoader.style.display = 'block';

  event.target.elements['message'].disabled = true;

  $.ajax(
  {
    method: 'POST', dataType: 'json', data: { messageData: JSON.stringify({ conversationUuid: conversationUuid, messageContent: message, participants: null }) }, timeout: 10000, url: '/api/messenger/post-message',

    error: (xhr, textStatus, errorThrown) =>
    {
      submitButton.removeAttribute('style');
      submitLoader.removeAttribute('style');

      input.disabled = false;

      xhr.responseJSON != undefined
      ? displayMessengerError(xhr.responseJSON.message, true)
      : displayMessengerError(commonStrings.messenger.genericErrorMessage, true);
    }

  }).done((result) =>
  {
    submitButton.removeAttribute('style');
    submitLoader.removeAttribute('style');

    input.value = '';
    input.disabled = false;
  });
}

/****************************************************************************************************/