/****************************************************************************************************/

function sendRemoveServiceRequest(serviceName)
{
  document.getElementById('serviceBlockRemovePromptMessage').remove();
  document.getElementById('serviceBlockRemovePromptWarning').remove();
  document.getElementById('serviceBlockRemovePromptConfirm').remove();
  document.getElementById('serviceBlockRemovePromptCancel').remove();

  var loading         = document.createElement('div');

  loading             .setAttribute('class', 'serviceBlockRemovePromptLoading');

  loading             .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

  document.getElementById('serviceBlockRemovePrompt').appendChild(loading);

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  data.append('service', serviceName);

  xhr.timeout = 10000;
  xhr.responseType = 'json';

  xhr.open('POST', '/queries/storage/services/remove-service', true);

  xhr.send(data);

  xhr.ontimeout = () =>
  {
    loading.remove();

    displayPromptError('La requête a expiré, veuillez réessayer plus tard', null);
  }

  xhr.onload = () =>
  {
    loading.remove();

    if(xhr.status == 200)
    {
      displayPromptSuccess(xhr.response.message, xhr.response.detail);

      socket.emit('storageAppAdminServiceRemoved', serviceName);
    }

    else
    {
      displayPromptError(xhr.response.message, xhr.response.detail);
    }
  }
}

/****************************************************************************************************/

function displayPromptSuccess(message, detail)
{
  var successBlock      = document.createElement('div');
  var successMessage    = document.createElement('div');
  var successClose      = document.createElement('button');

  successBlock          .setAttribute('class', 'serviceBlockRemovePromptSuccess');
  successMessage        .setAttribute('class', 'serviceBlockRemovePromptSuccessMessage');
  successClose          .setAttribute('class', 'serviceBlockRemovePromptSuccessClose');

  successMessage        .innerText = message;
  successClose          .innerText = 'OK';

  successClose          .addEventListener('click', closeRemovePopup);

  successBlock          .appendChild(successMessage);
  successBlock          .appendChild(successClose);

  if(detail != null)
  {
    var successDetail     = document.createElement('div');

    successDetail         .innerText = detail;
    successDetail         .setAttribute('class', 'serviceBlockRemovePromptSuccessDetail');

    successBlock          .appendChild(successDetail);
  }

  document.getElementById('serviceBlockRemovePrompt').appendChild(successBlock);
}

/****************************************************************************************************/