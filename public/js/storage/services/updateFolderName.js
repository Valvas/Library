/****************************************************************************************************/

function updateFolderNameOpenPopup(storageAppStrings, folderUuid)
{
  if(document.getElementById('renameFolderBackground')) return;

  createBackground('renameFolderBackground');

  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var error   = document.createElement('div');
  var input   = document.createElement('input');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('class', 'standardPopup');
  error       .setAttribute('class', 'folderMenuRenamePopupError');
  input       .setAttribute('class', 'folderMenuRenamePopupInput');
  buttons     .setAttribute('class', 'folderMenuRenamePopupButtons');
  confirm     .setAttribute('class', 'folderMenuRenamePopupConfirm');
  cancel      .setAttribute('class', 'folderMenuRenamePopupCancel');

  popup       .setAttribute('id', 'renameFolderPopup');

  error       .innerText = storageAppStrings.services.detailPage.folderMenu.renamePopup.error;

  input       .setAttribute('type', 'text');

  input       .setAttribute('placeholder', storageAppStrings.services.detailPage.folderMenu.renamePopup.placeholder);

  popup       .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.detailPage.folderMenu.renamePopup.title}</div>`;
  popup       .innerHTML += `<div class="standardPopupMessage">${storageAppStrings.services.detailPage.folderMenu.renamePopup.message}</div>`;

  confirm     .innerText = storageAppStrings.services.detailPage.folderMenu.renamePopup.confirm;
  cancel      .innerText = storageAppStrings.services.detailPage.folderMenu.renamePopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    error.removeAttribute('style');

    if(new RegExp('^[A-Za-z0-9]+(( )?[a-zA-Z0-9]+)*$').test(input.value) == false) return error.style.display = 'block';

    return updateFolderNameOpenConfirmation(storageAppStrings, folderUuid, input.value);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('renameFolderBackground');
  });

  popup       .appendChild(error);
  popup       .appendChild(input);
  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);
  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function updateFolderNameOpenConfirmation(storageAppStrings, folderUuid, newFolderName)
{
  document.getElementById('renameFolderPopup').style.display = 'none';

  var popup   = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('class', 'standardPopup');
  confirm     .setAttribute('class', 'standardPopupConfirm');
  cancel      .setAttribute('class', 'standardPopupCancel');

  popup       .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.detailPage.folderMenu.renamePopup.confirmationTitle}</div>`;
  popup       .innerHTML += `<div class="standardPopupMessage">${storageAppStrings.services.detailPage.folderMenu.renamePopup.confirmationMessage}</div>`;

  confirm     .innerText = storageAppStrings.services.detailPage.folderMenu.renamePopup.confirmationSend;
  cancel      .innerText = storageAppStrings.services.detailPage.folderMenu.renamePopup.confirmationBack;

  confirm     .addEventListener('click', () =>
  {
    popup.remove();

    return updateFolderNameSendRequestToServer(storageAppStrings, folderUuid, newFolderName);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    document.getElementById('renameFolderPopup').removeAttribute('style');
  });

  popup       .appendChild(confirm);
  popup       .appendChild(cancel);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function updateFolderNameSendRequestToServer(storageAppStrings, folderUuid, newFolderName)
{
  displayLoader(storageAppStrings.services.detailPage.folderMenu.renamePopup.savingLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { folderUuid: folderUuid, newFolderName: newFolderName }, timeout: 10000, url: '/queries/storage/services/update-folder-name',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        document.getElementById('renameFolderPopup').removeAttribute('style');
  
        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'folderMenuError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'folderMenuError');
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () => {  });
      
      document.getElementById('renameFolderPopup').remove();

      removeBackground('renameFolderBackground');

      displaySuccess(result.message, null, 'renameFolderSuccess');
    });
  });
}

/****************************************************************************************************/