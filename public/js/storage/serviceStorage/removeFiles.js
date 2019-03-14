/****************************************************************************************************/

function removeFilesOpenPrompt()
{
  if(document.getElementById('veilBackground')) return;

  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  var filesToRemove = [];

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getElementsByTagName('input').length === 0) continue;

    if(currentFiles[x].getElementsByTagName('input')[0].checked) filesToRemove.push({ fileUuid: currentFiles[x].getAttribute('name'), fileName: currentFiles[x].children[currentFiles[x].children.length - 1].innerText });
  }

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

  modalHeaderTitle      .innerText = storageStrings.serviceSection.removeFilesPopup.title;
  modalContentConfirm   .innerText = storageStrings.serviceSection.removeFilesPopup.confirm.replace('$[1]', filesToRemove.length);
  modalContentCancel    .innerText = commonStrings.global.cancel;

  modalContent          .innerHTML += `<div class="baseModalContentMessage">${storageStrings.serviceSection.removeFilesPopup.message}</div>`;

  for(var x = 0; x < filesToRemove.length; x++)
  {
    modalContent        .innerHTML += `<div class="serviceRemoveFilesPopupElement">${filesToRemove[x].fileName}</div>`;
  }

  modalHeader           .appendChild(modalHeaderTitle);
  modalContent          .appendChild(modalContentFiles);
  modalContent          .appendChild(modalContentButtons);
  modalContentButtons   .appendChild(modalContentConfirm);
  modalContentButtons   .appendChild(modalContentCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  modalContentConfirm   .addEventListener('click', () =>
  {
    modal.remove();

    return removeFilesSendToServer(filesToRemove);
  });

  modalContentCancel    .addEventListener('click', () =>
  {
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

function removeFilesSendToServer(filesToRemove)
{
  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  var filesUuid = [];

  for(var x = 0; x < filesToRemove.length; x++) filesUuid.push(filesToRemove[x].fileUuid);

  displayLoader(storageStrings.serviceSection.removeFilesPopup.loader, (loader) =>
  {
    $.ajax(
    {
      method: 'DELETE', dataType: 'json', timeout: 10000, data: { filesToRemove: JSON.stringify(filesUuid), serviceUuid: serviceUuid }, url: '/queries/storage/services/remove-files',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('modalVeil').remove();
          document.getElementById('modalBackground').remove();
          document.getElementById('mainContainer').removeAttribute('style');

          xhr.responseJSON != undefined
          ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'removeFilesError')
          : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'removeFilesError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('modalVeil').remove();
        document.getElementById('modalBackground').remove();
        document.getElementById('mainContainer').removeAttribute('style');

        return displaySuccess(result.message, null, 'removeFilesSuccess');
      });
    });
  });
}

/****************************************************************************************************/
