/****************************************************************************************************/

function createBugReportOpenConfirmModal(event)
{
  event.preventDefault();

  if(document.getElementById('veilBackground')) return;

  const reportMessage = event.target.elements['message'].value.trim();

  if(reportMessage.length === 0) return;

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

  modalHeaderTitle      .innerText = commonStrings.root.bugs.createForm.confirmModal.title;
  modalContentConfirm   .innerText = commonStrings.root.bugs.createForm.confirmModal.confirm;
  modalContentCancel    .innerText = commonStrings.global.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${commonStrings.root.bugs.createForm.confirmModal.message}</div>`;

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
    modal.remove();
    createBugReportSendToServer(reportMessage);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    checkMessageTag('createBugReportError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function createBugReportSendToServer(reportMessage)
{
  displayLoader(commonStrings.root.bugs.createForm.loader, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 10000, data: { reportMessage: reportMessage }, url: '/queries/root/bugs/create-report',
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('mainContainer').removeAttribute('style');
          document.getElementById('modalBackground').remove();
          document.getElementById('veilBackground').remove();

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createBugReportError') :
          displayError(commonStrings.global.xhrErrors.timeout, null, 'createBugReportError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        if(document.getElementById('bugReportForm'))
        {
          document.getElementById('bugReportForm').reset();
        }

        document.getElementById('mainContainer').removeAttribute('style');
        document.getElementById('modalBackground').remove();
        document.getElementById('veilBackground').remove();

        displaySuccess(result.message, null, 'createBugReportSuccess');
      });
    });
  });
}

/****************************************************************************************************/
