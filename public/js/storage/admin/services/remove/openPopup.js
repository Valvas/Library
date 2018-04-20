/****************************************************************************************************/

function openRemovePopup(event)
{
  var button = event.target;

  var getServiceNameLoop = () =>
  {
    button = button.parentNode;

    if(button.tagName != 'BUTTON') getServiceNameLoop();
  }

  if(button.tagName != 'BUTTON') getServiceNameLoop();

  var background      = document.createElement('div');
  var prompt          = document.createElement('div');
  var title           = document.createElement('div');
  var loading         = document.createElement('div');

  background          .setAttribute('class', 'background');
  prompt              .setAttribute('class', 'serviceBlockRemovePrompt');
  title               .setAttribute('class', 'serviceBlockRemovePromptTitle');
  loading             .setAttribute('class', 'serviceBlockRemovePromptLoading');

  background          .setAttribute('id', 'serviceBlockRemoveBackground');
  prompt              .setAttribute('id', 'serviceBlockRemovePrompt');

  title               .innerText = '...';

  loading             .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

  prompt              .appendChild(title);
  prompt              .appendChild(loading);

  background          .appendChild(prompt);

  document.body       .appendChild(background);

  background          .style.display = 'block';

  document.getElementById('blur').style.filter = 'blur(4px)';

  var xhr = new XMLHttpRequest();

  xhr.responseType = 'json';
  xhr.timeout = 10000;

  xhr.open('GET', '/queries/storage/strings', true);

  xhr.send(null);

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
      title           .innerText = xhr.response.strings.admin.services.remove.popup.title;

      var message     = document.createElement('div');
      var warning     = document.createElement('div');
      var confirm     = document.createElement('div');
      var cancel      = document.createElement('div');

      message         .setAttribute('class', 'serviceBlockRemovePromptMessage');
      warning         .setAttribute('class', 'serviceBlockRemovePromptWarning');
      confirm         .setAttribute('class', 'serviceBlockRemovePromptConfirm');
      cancel          .setAttribute('class', 'serviceBlockRemovePromptCancel');

      message         .setAttribute('id', 'serviceBlockRemovePromptMessage');
      warning         .setAttribute('id', 'serviceBlockRemovePromptWarning');
      confirm         .setAttribute('id', 'serviceBlockRemovePromptConfirm');
      cancel          .setAttribute('id', 'serviceBlockRemovePromptCancel');

      message         .innerText = xhr.response.strings.admin.services.remove.popup.message + ' "' + button.parentNode.getAttribute('name') + '" ?';
      warning         .innerText = xhr.response.strings.admin.services.remove.popup.warning;
      confirm         .innerHTML = `<i class='fas fa-check-circle'></i>`;
      cancel          .innerHTML = `<i class='fas fa-times-circle'></i>`;

      confirm         .addEventListener('click', () => { sendRemoveServiceRequest(button.parentNode.getAttribute('name')); });
      cancel          .addEventListener('click', closeRemovePopup);

      prompt          .appendChild(message);
      prompt          .appendChild(warning);
      prompt          .appendChild(confirm);
      prompt          .appendChild(cancel);
    }

    else
    {
      displayPromptError(xhr.response.message, xhr.response.detail);
    }
  }
}

/****************************************************************************************************/

function displayPromptError(message, detail)
{
  var errorBlock      = document.createElement('div');
  var errorMessage    = document.createElement('div');
  var errorClose      = document.createElement('button');

  errorBlock          .setAttribute('class', 'serviceBlockRemovePromptError');
  errorMessage        .setAttribute('class', 'serviceBlockRemovePromptErrorMessage');
  errorClose          .setAttribute('class', 'serviceBlockRemovePromptErrorClose');

  errorMessage        .innerText = message;
  errorClose          .innerText = 'OK';

  errorClose          .addEventListener('click', closeRemovePopup);

  errorBlock          .appendChild(errorMessage);
  errorBlock          .appendChild(errorClose);

  if(detail != null)
  {
    var errorDetail     = document.createElement('div');

    errorDetail         .innerText = detail;
    errorDetail         .setAttribute('class', 'serviceBlockRemovePromptErrorDetail');

    errorBlock          .appendChild(errorDetail);
  }

  document.getElementById('serviceBlockRemovePrompt').appendChild(errorBlock);
}

/****************************************************************************************************/

function closeRemovePopup(event)
{
  document.getElementById('serviceBlockRemoveBackground').remove();
  document.getElementById('blur').removeAttribute('style');
}

/****************************************************************************************************/