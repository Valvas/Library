/****************************************************************************************************/

function exitApp()
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  var veilBackground        = document.createElement('div');
  var verticalBackground    = document.createElement('div');
  var horizontalBackground  = document.createElement('div');
  var modal                 = document.createElement('div');
  var modalHeader           = document.createElement('div');
  var modalHeaderTitle      = document.createElement('div');
  var modalContent          = document.createElement('div');
  var modalContentButtons   = document.createElement('div');
  var modalContentConfirm   = document.createElement('button');
  var modalContentCancel    = document.createElement('button');

  veilBackground        .setAttribute('id', 'veilBackground');
  verticalBackground    .setAttribute('id', 'modalBackground');

  veilBackground        .setAttribute('class', 'veilBackground');
  verticalBackground    .setAttribute('class', 'modalBackgroundVertical');
  horizontalBackground  .setAttribute('class', 'modalBackgroundHorizontal');
  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalContent          .setAttribute('class', 'baseModalContent');
  modalContentButtons   .setAttribute('class', 'baseModalContentButtons');
  modalContentConfirm   .setAttribute('class', 'baseModalContentButtonsConfirm');
  modalContentCancel    .setAttribute('class', 'baseModalContentButtonsCancel');

  modalHeaderTitle      .innerText = storageStrings.exitPrompt.title;
  modalContentConfirm   .innerText = storageStrings.exitPrompt.confirm;
  modalContentCancel    .innerText = storageStrings.exitPrompt.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${storageStrings.exitPrompt.message}</div>`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalContent          .appendChild(modalContentButtons);
  modalContentButtons   .appendChild(modalContentConfirm);
  modalContentButtons   .appendChild(modalContentCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalContentConfirm   .addEventListener('click', () =>
  {
    window.location = '/home';
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

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
