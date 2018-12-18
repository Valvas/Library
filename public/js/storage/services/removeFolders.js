/****************************************************************************************************/

function removeFolderOpenConfirmationPopup(storageAppStrings, folderUuid)
{
  if(document.getElementById('removeFolderBackground')) return;

  createBackground('removeFolderBackground');

  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('class', 'standardPopup');
  buttons     .setAttribute('class', 'removeFolderPopupButtons');
  confirm     .setAttribute('class', 'removeFolderPopupConfirm');
  cancel      .setAttribute('class', 'removeFolderPopupCancel');

  popup       .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.detailPage.folderMenu.removePopup.title}</div>`;
  popup       .innerHTML += `<div class="standardPopupMessage">${storageAppStrings.services.detailPage.folderMenu.removePopup.message}</div>`;
  popup       .innerHTML += `<div class="removeFolderPopupWarning">${storageAppStrings.services.detailPage.folderMenu.removePopup.warning}</div>`;

  confirm     .innerText = storageAppStrings.services.detailPage.folderMenu.removePopup.confirm;
  cancel      .innerText = storageAppStrings.services.detailPage.folderMenu.removePopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    popup.remove();
    removeFolderSendDataToServer(storageAppStrings, folderUuid);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('removeFolderBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function removeFolderSendDataToServer(storageAppStrings, folderUuid)
{
  displayLoader(storageAppStrings.services.detailPage.folderMenu.removePopup.removeLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'DELETE', dataType: 'json', timeout: 10000, data: { folderUuid: folderUuid, serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, url: '/queries/storage/services/remove-folder',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });
        removeBackground('removeFolderBackground');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () => {  });
      removeBackground('removeFolderBackground');

      displaySuccess(result.message, null, null);
    });
  });
}

/****************************************************************************************************/