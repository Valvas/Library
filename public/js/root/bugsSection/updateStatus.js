/****************************************************************************************************/

function updateReportStatusOpenPrompt()
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  const veilBackground        = document.createElement('div');
  const verticalBackground    = document.createElement('div');
  const horizontalBackground  = document.createElement('div');
  const modal                 = document.createElement('div');
  const modalHeader           = document.createElement('div');
  const modalHeaderTitle      = document.createElement('div');
  const modalContent          = document.createElement('form');
  const modalContentSelect    = document.createElement('select');
  const modalContentButtons   = document.createElement('div');
  const modalContentConfirm   = document.createElement('button');
  const modalContentCancel    = document.createElement('button');

  veilBackground        .setAttribute('id', 'veilBackground');
  verticalBackground    .setAttribute('id', 'modalBackground');

  modalContentSelect    .setAttribute('name', 'status');

  veilBackground        .setAttribute('class', 'veilBackground');
  verticalBackground    .setAttribute('class', 'modalBackgroundVertical');
  horizontalBackground  .setAttribute('class', 'modalBackgroundHorizontal');
  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalContent          .setAttribute('class', 'baseModalContent');
  modalContentSelect    .setAttribute('class', 'bugsDetailStatusList');
  modalContentButtons   .setAttribute('class', 'baseModalContentButtons');
  modalContentConfirm   .setAttribute('class', 'baseModalContentButtonsConfirm');
  modalContentCancel    .setAttribute('class', 'baseModalContentButtonsCancel');

  modalHeaderTitle      .innerText = commonStrings.root.bugs.detail.updateStatusPrompt.title;
  modalContentConfirm   .innerText = commonStrings.root.bugs.detail.updateStatusPrompt.confirm;
  modalContentCancel    .innerText = commonStrings.global.cancel;

  modalContent          .innerHTML += `<div class="baseModalContentMessage">${commonStrings.root.bugs.detail.updateStatusPrompt.message}</div>`;

  modalContentSelect    .innerHTML += `<option value="pending">${commonStrings.root.bugs.detail.status.pending}</option>`;
  modalContentSelect    .innerHTML += `<option value="resolved">${commonStrings.root.bugs.detail.status.resolved}</option>`;
  modalContentSelect    .innerHTML += `<option value="closed">${commonStrings.root.bugs.detail.status.closed}</option>`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalContent          .appendChild(modalContentSelect);
  modalContent          .appendChild(modalContentButtons);
  modalContentButtons   .appendChild(modalContentConfirm);
  modalContentButtons   .appendChild(modalContentCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalContent          .addEventListener('submit', () =>
  {
    event.preventDefault()
    modal.remove();
    updateReportStatusSendToServer(event.target.elements['status'].options[event.target.elements['status'].selectedIndex].value);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    event.preventDefault();
    checkMessageTag('updateBugReportStatusError');
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function updateReportStatusSendToServer(newStatus)
{
  const reportUuid = document.getElementById('reportUuid').getAttribute('name');

  displayLoader(commonStrings.root.bugs.detail.commentConfirmationLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 10000, data: { reportUuid: reportUuid }, url: `/queries/root/bugs/set-to-${newStatus}`,
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('mainContainer').removeAttribute('style');
          document.getElementById('modalBackground').remove();
          document.getElementById('veilBackground').remove();

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateBugReportStatusError') :
          displayError(commonStrings.global.xhrErrors.timeout, null, 'updateBugReportStatusError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('mainContainer').removeAttribute('style');
        document.getElementById('modalBackground').remove();
        document.getElementById('veilBackground').remove();

        displaySuccess(result.message, null, 'updateBugReportStatusSuccess');
      });
    });
  });
}

/****************************************************************************************************/
