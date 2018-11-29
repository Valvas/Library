/****************************************************************************************************/

var storageAppStrings = null;

if(document.getElementById('createFolderButton')) document.getElementById('createFolderButton').addEventListener('click', openCreateFolderPopup);

/****************************************************************************************************/

function openCreateFolderPopup()
{
  if(document.getElementById('createFolderBackground')) return;

  createBackground('createFolderBackground');

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        displayError(error.message, error.detail, null);
        removeBackground('createFolderBackground');
        return;
      }

      storageAppStrings = strings;

      var popup         = document.createElement('div');
      var popupButtons  = document.createElement('div');
      var popupConfirm  = document.createElement('button');
      var popupCancel   = document.createElement('button');

      popup             .setAttribute('id', 'createFolderPopup');

      popup             .setAttribute('class', 'standardPopup');
      popupButtons      .setAttribute('class', 'createFolderPopupButtons');
      popupConfirm      .setAttribute('class', 'createFolderPopupConfirm');
      popupCancel       .setAttribute('class', 'createFolderPopupCancel');

      popup             .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.newFolder.popupTitle}</div>`;
      popup             .innerHTML += `<div class="createFolderPopupHelp">${storageAppStrings.services.newFolder.popupHelpMessage}</div>`;
      popup             .innerHTML += `<input id="createFolderName" class="createFolderPopupInput" placeholder="${storageAppStrings.services.newFolder.popupPlaceholder}" type="text" />`;

      popupConfirm      .innerText = storageAppStrings.services.newFolder.popupSendButton;
      popupCancel       .innerText = storageAppStrings.services.newFolder.popupCancelButton;

      popupCancel       .addEventListener('click', () =>
      {
        popup.remove();
        removeBackground('createFolderBackground');
      });

      popupConfirm      .addEventListener('click', sendNewFolder);

      popupButtons      .appendChild(popupConfirm);
      popupButtons      .appendChild(popupCancel);
      popup             .appendChild(popupButtons);
      document.body     .appendChild(popup);
    });
  });
}

/****************************************************************************************************/

function sendNewFolder()
{
  if(document.getElementById('serviceUuid') == null) return;
  if(document.getElementById('currentFolder') == null) return;
  if(document.getElementById('createFolderName') == null) return;
  if(document.getElementById('createFolderPopup') == null) return;

  document.getElementById('createFolderPopup').style.display = 'none';

  displayLoader(storageAppStrings.services.newFolder.popupLoader, (loader) =>
  {
    const folderName = document.getElementById('createFolderName').value;

    if(new RegExp('^[a-zA-Z0-9]([ ]?[a-zA-Z0-9]+)*$').test(folderName) == false)
    {
      removeLoader(loader, () => {  });

      displayError(storageAppStrings.services.newFolder.popupFormatError, null, 'createFolderFormatError');

      document.getElementById('createFolderPopup').removeAttribute('style');

      return;
    }

    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 10000, data: { newFolderName: folderName, parentFolderUuid: document.getElementById('currentFolder').hasAttribute('name') ? document.getElementById('currentFolder').getAttribute('name') : '', serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, url: '/queries/storage/services/create-new-folder',
      
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        document.getElementById('createFolderPopup').removeAttribute('style');
  
        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createForlderServerError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'createForlderServerError');
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('createFolderPopup').remove();

        removeBackground('createFolderBackground');

        displaySuccess(result.message, null, null);
      });
    });
  });
}

/****************************************************************************************************/