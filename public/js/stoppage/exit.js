/****************************************************************************************************/

function openExitPrompt()
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  const veilBackground        = document.createElement('div');
  const verticalBackground    = document.createElement('div');
  const horizontalBackground  = document.createElement('div');
  const modal                 = document.createElement('div');
  const modalHeader           = document.createElement('div');
  const modalHeaderTitle      = document.createElement('div');
  const modalContent          = document.createElement('div');
  const modalContentButtons   = document.createElement('div');
  const modalContentConfirm   = document.createElement('button');
  const modalContentCancel    = document.createElement('button');

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

  modalHeaderTitle      .innerText = appStrings.exitPrompt.title;
  modalContentConfirm   .innerText = appStrings.exitPrompt.confirm;
  modalContentCancel    .innerText = appStrings.exitPrompt.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${appStrings.exitPrompt.message}</div>`;

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
