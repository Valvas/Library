/****************************************************************************************************/

function renameFolderOpenPrompt(folderName, folderUuid)
{
  if(document.getElementById('veilBackground')) return;

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  var veilBackground        = document.createElement('div');
  var verticalBackground    = document.createElement('div');
  var horizontalBackground  = document.createElement('div');
  var modal                 = document.createElement('div');
  var modalHeader           = document.createElement('div');
  var modalHeaderTitle      = document.createElement('div');
  var modalForm             = document.createElement('form');
  var modalFormButtons      = document.createElement('div');
  var modalFormConfirm      = document.createElement('button');
  var modalFormCancel       = document.createElement('button');

  veilBackground        .setAttribute('id', 'veilBackground');
  verticalBackground    .setAttribute('id', 'modalBackground');

  veilBackground        .setAttribute('class', 'veilBackground');
  verticalBackground    .setAttribute('class', 'modalBackgroundVertical');
  horizontalBackground  .setAttribute('class', 'modalBackgroundHorizontal');
  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalForm             .setAttribute('class', 'serviceCreateFolderForm');
  modalFormButtons      .setAttribute('class', 'serviceCreateFolderFormButtons');
  modalFormConfirm      .setAttribute('class', 'serviceCreateFolderFormButtonsSubmit');
  modalFormCancel       .setAttribute('class', 'serviceCreateFolderFormButtonsCancel');

  modalHeaderTitle      .innerText = storageStrings.serviceSection.renameFolderPopup.title;
  modalFormConfirm      .innerText = storageStrings.serviceSection.renameFolderPopup.confirm;
  modalFormCancel       .innerText = commonStrings.global.cancel;

  modalForm             .innerHTML += `<div class="serviceCreateFolderFormMessage">${storageStrings.serviceSection.renameFolderPopup.message}</div>`;
  modalForm             .innerHTML += `<input value="${folderName}" name="name" type="text" class="serviceCreateFolderFormInput" placeholder="${storageStrings.serviceSection.renameFolderPopup.placeholder}" required />`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalForm             .appendChild(modalFormButtons);
  modalFormButtons      .appendChild(modalFormConfirm);
  modalFormButtons      .appendChild(modalFormCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalForm);

  verticalBackground    .appendChild(horizontalBackground);
  horizontalBackground  .appendChild(modal);

  modalForm             .addEventListener('submit', () =>
  {
    event.preventDefault();
    renameFolderSendToServer(folderUuid);
  });

  modalFormCancel       .addEventListener('click', () =>
  {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('mainContainer').removeAttribute('style');
    verticalBackground.remove();
    veilBackground.remove();
  });

  document.body         .appendChild(veilBackground);
  document.body         .appendChild(verticalBackground);
}

/****************************************************************************************************/

function renameFolderSendToServer(folderUuid)
{
  checkMessageTag('updateFolderNameError');
  checkMessageTag('updateFolderNameFormatError');

  const folderName = event.target.elements['name'].value.trim();

  if(folderName.indexOf('*') > -1 || folderName.indexOf('!') > -1 || folderName.indexOf(':') > -1 || folderName.indexOf('?') > -1 || folderName.indexOf('"') > -1 || folderName.indexOf('<') > -1 || folderName.indexOf('>') > -1 || folderName.indexOf('|') > -1)
  {
    return displayError(storageStrings.services.newFolder.popupFormatError, null, 'updateFolderNameFormatError');
  }

  document.getElementById('modalBackground').style.display = 'none';

  displayLoader(storageStrings.serviceSection.renameFolderPopup.loader, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { folderUuid: folderUuid, newFolderName: folderName }, timeout: 10000, url: '/queries/storage/services/update-folder-name',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('modalBackground').removeAttribute('style');

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateFolderNameError') :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateFolderNameError');
        });
      }

    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('mainContainer').removeAttribute('style');
        document.getElementById('veilBackground').remove();
        document.getElementById('modalBackground').remove();

        displaySuccess(result.message, null, 'updateFolderNameSuccess');
      });
    });
  });
}

/****************************************************************************************************/
