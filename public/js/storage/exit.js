/****************************************************************************************************/

function openExitPrompt()
{
  var spinner         = document.createElement('div');
  var background      = document.createElement('div');
  var prompt          = document.createElement('div');
  var promptTitle     = document.createElement('div');
  var promptMessage   = document.createElement('div');
  var promptValidate  = document.createElement('button');
  var promptCancel    = document.createElement('button');

  spinner             .setAttribute('class', 'storageSpinner');
  background          .setAttribute('class', 'storageBackground');
  prompt              .setAttribute('class', 'storagePopup');
  promptTitle         .setAttribute('class', 'storagePopupTitle');
  promptMessage       .setAttribute('class', 'storagePopupMessage');
  promptValidate      .setAttribute('class', 'storagePopupValidate');
  promptCancel        .setAttribute('class', 'storagePopupCancel');

  spinner             .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  promptValidate      .addEventListener('click', () =>
  {
    location = '/home';
  });

  promptCancel        .addEventListener('click', () =>
  {
    prompt.remove();
    background.remove();
  });

  prompt              .appendChild(promptTitle);
  prompt              .appendChild(promptMessage);
  prompt              .appendChild(promptValidate);
  prompt              .appendChild(promptCancel);

  document.body       .appendChild(background);
  document.body       .appendChild(spinner);

  $.ajax(
  {
    method: 'GET',
    dataType: 'json',
    timeout: 5000,
    url: '/queries/storage/strings',

    error: (xhr, textStatus, errorThrown) =>
    {
      spinner.remove();
      background.remove();

      xhr.responseJSON != undefined
      ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    const strings = json.strings;

    spinner.remove();

    promptTitle       .innerText = strings.exitPrompt.title;
    promptMessage     .innerText = strings.exitPrompt.message;
    promptValidate    .innerText = strings.exitPrompt.validate;
    promptCancel      .innerText = strings.exitPrompt.cancel;

    document.body     .appendChild(prompt);
  });
}

/****************************************************************************************************/