/****************************************************************************************************/

function openRemovePopup(serviceName, serviceUUID)
{
  displayLoadingVeil();

  $.ajax(
  {
    type: 'GET', timeout: 5000, dataType: 'JSON', url: '/queries/storage/strings',
    error: (xhr, status, error) => 
    {
      removeLoadingVeil();

      if(status == 'timeout')
      {
        printError('Le serveur a mis trop de temps à répondre', 'Celui-ci est peut-être injoignable pour le moment');
      }

      else
      {
        printError(xhr.responseJSON.message, xhr.responseJSON.detail);
      }
    }
                
  }).done((json) =>
  {
    removeLoadingVeil();

    var background      = document.createElement('div');
    var prompt          = document.createElement('div');
    var title           = document.createElement('div');
    var message         = document.createElement('div');
    var warning         = document.createElement('div');
    var confirm         = document.createElement('div');
    var cancel          = document.createElement('div');

    background          .setAttribute('class', 'serviceBlockRemoveVeil');
    prompt              .setAttribute('class', 'serviceBlockRemovePrompt');
    title               .setAttribute('class', 'serviceBlockRemovePromptTitle');
    message             .setAttribute('class', 'serviceBlockRemovePromptMessage');
    warning             .setAttribute('class', 'serviceBlockRemovePromptWarning');
    confirm             .setAttribute('class', 'serviceBlockRemovePromptConfirm');
    cancel              .setAttribute('class', 'serviceBlockRemovePromptCancel');

    title               .innerText = json.strings.admin.services.remove.popup.title;
    message             .innerText = json.strings.admin.services.remove.popup.message + ' "' + serviceName + '" ?';
    warning             .innerText = json.strings.admin.services.remove.popup.warning;
    confirm             .innerHTML = `<i class='fas fa-check-circle'></i>`;
    cancel              .innerHTML = `<i class='fas fa-times-circle'></i>`;

    background          .setAttribute('id', 'serviceBlockRemoveBackground');
    prompt              .setAttribute('id', 'serviceBlockRemovePrompt');

    confirm             .addEventListener('click', () => { sendRemoveServiceRequest(serviceUUID); });
    cancel              .addEventListener('click', closeRemovePopup);

    prompt              .appendChild(title);
    prompt              .appendChild(message);
    prompt              .appendChild(warning);
    prompt              .appendChild(confirm);
    prompt              .appendChild(cancel);

    document.body       .appendChild(background);
    document.body       .appendChild(prompt);
  });
}

/****************************************************************************************************/

function closeRemovePopup()
{
  document.getElementById('serviceBlockRemoveBackground').remove();
  document.getElementById('serviceBlockRemovePrompt').remove();
}

/****************************************************************************************************/