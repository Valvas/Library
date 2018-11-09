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
        displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null, 'createForlderServerError');
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

function renameFolder(folderUuid, currentFolderName)
{
  if(document.getElementById('renameFolderPopup') == null)
  {
    var background          = document.createElement('div');
    var spinner             = document.createElement('div');
    var popup               = document.createElement('div');
    var title               = document.createElement('div');
    var message             = document.createElement('div');
    var currentNameLabel    = document.createElement('div');
    var currentNameValue    = document.createElement('div');
    var newNameInput        = document.createElement('input');
    var sendButton          = document.createElement('button');
    var cancelButton        = document.createElement('button');

    background        .setAttribute('id', 'renameFolderBackground');
    popup             .setAttribute('id', 'renameFolderPopup');
    newNameInput      .setAttribute('id', 'renameFolderPopupInput');

    popup             .setAttribute('name', folderUuid);

    background        .setAttribute('class', 'storageBackground');
    spinner           .setAttribute('class', 'storageSpinner');
    popup             .setAttribute('class', 'storagePopup');
    title             .setAttribute('class', 'storagePopupTitle');
    message           .setAttribute('class', 'renameFolderPopupMessage');
    currentNameLabel  .setAttribute('class', 'renameFolderPopupCurrentNameLabel');
    currentNameValue  .setAttribute('class', 'renameFolderPopupCurrentNameValue');
    newNameInput      .setAttribute('class', 'renameFolderPopupNewNameInput');
    sendButton        .setAttribute('class', 'renameFolderPopupSend');
    cancelButton      .setAttribute('class', 'renameFolderPopupCancel');

    sendButton        .addEventListener('click', () => { sendNewFolderName(folderUuid, newNameInput.value); });
    cancelButton      .addEventListener('click', closeRenameFolderPopup);
    newNameInput      .addEventListener('focus', () => { newNameInput.removeAttribute('style'); });

    spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    document.body     .appendChild(background);
    document.body     .appendChild(spinner);

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
  
        xhr.responseJSON != undefined ?
        displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
        displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
  
    }).done((json) =>
    {
      spinner.remove();

      title               .innerText = json.strings.services.folderDetail.renamePopup.title;
      message             .innerText = json.strings.services.folderDetail.renamePopup.message;
      currentNameLabel    .innerText = json.strings.services.folderDetail.renamePopup.currentName;
      sendButton          .innerText = json.strings.services.folderDetail.renamePopup.send;
      cancelButton        .innerText = json.strings.services.folderDetail.renamePopup.cancel;
      currentNameValue    .innerText = currentFolderName;

      newNameInput        .setAttribute('placeholder', json.strings.services.folderDetail.renamePopup.placeholder);

      popup               .appendChild(title);
      popup               .appendChild(message);
      popup               .appendChild(currentNameLabel);
      popup               .appendChild(currentNameValue);
      popup               .appendChild(newNameInput);
      popup               .appendChild(sendButton);
      popup               .appendChild(cancelButton);
      document.body       .appendChild(popup);

      newNameInput.focus();
    });
  }
}

/****************************************************************************************************/

function closeRenameFolderPopup()
{
  if(document.getElementById('renameFolderBackground')) document.getElementById('renameFolderBackground').remove();
  if(document.getElementById('renameFolderPopup')) document.getElementById('renameFolderPopup').remove();
}

/****************************************************************************************************/

function sendNewFolderName(folderUuid, newFolderName)
{
  if(new RegExp('^[a-zA-Z0-9]([ ]?[a-zA-Z0-9]+)*$').test(newFolderName) == false)
  {
    if(document.getElementById('renameFolderPopupInput')) document.getElementById('renameFolderPopupInput').style.border = '1px solid #D9534F';
  }

  else
  {
    if(document.getElementById('renameFolderPopup')) $(document.getElementById('renameFolderPopup')).fadeOut(250, () =>
    {
      var spinner = document.createElement('div');

      spinner.setAttribute('class', 'storageSpinner');
      spinner.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
      $(spinner).hide().appendTo(document.body);

      if(document.getElementById('renameFolderBackground')) document.getElementById('renameFolderBackground').remove();
      if(document.getElementById('renameFolderPopup')) document.getElementById('renameFolderPopup').remove();

      $(spinner).fadeIn(250, () =>
      {
        $.ajax(
        {
          method: 'PUT',
          dataType: 'json',
          timeout: 5000,
          data: { newFolderName: newFolderName, folderUuid: folderUuid, serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
          url: '/queries/storage/services/update-folder-name',
      
          error: (xhr, textStatus, errorThrown) =>
          {
            spinner.remove();
      
            xhr.responseJSON != undefined ?
            displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
            displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
          }
      
        }).done((json) =>
        {
          spinner.remove();

          displaySuccessMessage(json.message, null);

          socket.emit('storageAppServicesFolderNameUpdated', folderUuid, document.getElementById('mainBlock').getAttribute('name'), newFolderName);
        });
      });
    });
  }
}

/****************************************************************************************************/