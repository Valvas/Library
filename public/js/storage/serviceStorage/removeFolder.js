/****************************************************************************************************/

function removeFolderOpenPrompt(folderUuid)
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  const modalVeil             = document.createElement('div');
  const modalBackground       = document.createElement('div');
  const modalContainer        = document.createElement('div');
  const modal                 = document.createElement('div');
  const modalHeader           = document.createElement('div');
  const modalHeaderTitle      = document.createElement('div');
  const modalContent          = document.createElement('div');
  const modalContentFiles     = document.createElement('div');
  const modalContentButtons   = document.createElement('div');
  const modalContentConfirm   = document.createElement('button');
  const modalContentCancel    = document.createElement('button');

  modalVeil             .setAttribute('id', 'modalVeil');
  modalBackground       .setAttribute('id', 'modalBackground');
  modalContainer        .setAttribute('id', 'modalContainer');

  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalContent          .setAttribute('class', 'baseModalContent');
  modalContentButtons   .setAttribute('class', 'baseModalContentButtons');
  modalContentConfirm   .setAttribute('class', 'baseModalContentButtonsConfirm');
  modalContentCancel    .setAttribute('class', 'baseModalContentButtonsCancel');

  modalHeaderTitle      .innerText = storageStrings.serviceSection.removeFolderPopup.title;
  modalContentConfirm   .innerText = storageStrings.serviceSection.removeFolderPopup.confirm;
  modalContentCancel    .innerText = commonStrings.global.cancel;

  modalContent          .innerHTML += `<div class="baseModalContentMessage">${storageStrings.serviceSection.removeFolderPopup.message}</div>`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalContent          .appendChild(modalContentFiles);
  modalContent          .appendChild(modalContentButtons);
  modalContentButtons   .appendChild(modalContentConfirm);
  modalContentButtons   .appendChild(modalContentCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  modalContentConfirm   .addEventListener('click', () =>
  {
    event.stopPropagation();

    modal.remove();

    return removeFolderSendToServer(folderUuid);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    event.stopPropagation();

    modalVeil.remove();
    modalBackground.remove();
    document.getElementById('mainContainer').removeAttribute('style');
  });

  modalContainer        .appendChild(modal);
  modalBackground       .appendChild(modalContainer);
  document.body         .appendChild(modalBackground);
  document.body         .appendChild(modalVeil);
}

/****************************************************************************************************/

function removeFolderSendToServer(folderUuid)
{
  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  displayLoader(storageStrings.serviceSection.removeFolderPopup.loader, (loader) =>
  {
    $.ajax(
    {
      method: 'DELETE', dataType: 'json', timeout: 10000, data: { folderUuid: folderUuid, serviceUuid: serviceUuid }, url: '/queries/storage/services/remove-folder',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('modalVeil').remove();
          document.getElementById('modalBackground').remove();
          document.getElementById('mainContainer').removeAttribute('style');

          xhr.responseJSON != undefined
          ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'removeFolderError')
          : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'removeFolderError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('modalVeil').remove();
        document.getElementById('modalBackground').remove();
        document.getElementById('mainContainer').removeAttribute('style');

        displaySuccess(result.message, null, 'removeFolderSuccess');
      });
    });
  });
}

/****************************************************************************************************/
