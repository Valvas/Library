/****************************************************************************************************/

if(document.getElementById('newFolderButton'))
{
  document.getElementById('newFolderButton').addEventListener('click', () =>
  {
    createNewFolder(document.getElementById('filesBlock').getAttribute('name'));
  });
}

/****************************************************************************************************/

function createNewFolder(currentFolderUuid)
{
  var spinner       = document.createElement('div');
  var background    = document.createElement('div');
  var popup         = document.createElement('div');
  var popupTitle    = document.createElement('div');
  var popupMessage  = document.createElement('div');
  var popupInput    = document.createElement('input');
  var popupSend     = document.createElement('button');
  var popupCancel   = document.createElement('button');

  spinner           .setAttribute('class', 'storageSpinner');
  background        .setAttribute('class', 'storageBackground');
  popup             .setAttribute('class', 'storagePopup');
  popupTitle        .setAttribute('class', 'storagePopupTitle');
  popupMessage      .setAttribute('class', 'newFolderHelpMessage');
  popupInput        .setAttribute('class', 'newFolderInput');
  popupSend         .setAttribute('class', 'newFolderSendButton');
  popupCancel       .setAttribute('class', 'newFolderCancelButton');

  background        .setAttribute('id', 'newFolderBackground');
  popup             .setAttribute('id', 'newFolderPopup');
  popupInput        .setAttribute('id', 'newFolderPopupInput');

  popup             .setAttribute('name', currentFolderUuid);

  popupInput        .setAttribute('type', 'text');

  popupInput        .addEventListener('focus', () => { popupInput.removeAttribute('style'); });
  popupCancel       .addEventListener('click', closeNewFolderPopup);
  popupSend         .addEventListener('click', () => { sendNewFolder(popupInput.value); });

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

    popupInput        .setAttribute('placeholder', json.strings.services.newFolder.popupPlaceholder);

    popupTitle        .innerText = json.strings.services.newFolder.popupTitle;
    popupMessage      .innerText = json.strings.services.newFolder.popupHelpMessage;
    popupSend         .innerText = json.strings.services.newFolder.popupSendButton;
    popupCancel       .innerText = json.strings.services.newFolder.popupCancelButton;

    popup             .appendChild(popupTitle);
    popup             .appendChild(popupInput);
    popup             .appendChild(popupMessage);
    popup             .appendChild(popupSend);
    popup             .appendChild(popupCancel);

    document.body     .appendChild(popup);

    popupInput        .focus();
  });
}

/****************************************************************************************************/

function closeNewFolderPopup()
{
  if(document.getElementById('newFolderPopup')) document.getElementById('newFolderPopup').remove();
  if(document.getElementById('newFolderBackground')) document.getElementById('newFolderBackground').remove();
}

/****************************************************************************************************/

function sendNewFolder(newFolderName)
{
  if(new RegExp('^[a-zA-Z0-9]([ ]?[a-zA-Z0-9]+)*$').test(newFolderName) == false)
  {
    if(document.getElementById('newFolderPopupInput')) document.getElementById('newFolderPopupInput').style.border = '1px solid #D9534F';
  }

  else
  {
    const parentFolderUuid = document.getElementById('newFolderPopup').getAttribute('name');
    
    if(document.getElementById('newFolderPopup')) document.getElementById('newFolderPopup').remove();

    var spinner       = document.createElement('div');

    spinner           .setAttribute('class', 'storageSpinner');
    spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    document.body     .appendChild(spinner);

    $.ajax(
    {
      method: 'POST',
      dataType: 'json',
      timeout: 5000,
      data: { newFolderName: newFolderName, parentFolderUuid: parentFolderUuid, serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
      url: '/queries/storage/services/create-new-folder',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        spinner.remove();

        if(document.getElementById('newFolderBackground')) document.getElementById('newFolderBackground').remove();
  
        xhr.responseJSON != undefined ?
        displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
        displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
  
    }).done((json) =>
    {
      spinner.remove();
        
      if(document.getElementById('newFolderBackground')) document.getElementById('newFolderBackground').remove();

      socket.emit('storageAppServicesFolderCreated', json.folderUuid, document.getElementById('mainBlock').getAttribute('name'), parentFolderUuid);

      displaySuccessMessage(json.message, null);
    });
  }
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

function removeFolder(folderUuid)
{

}

/****************************************************************************************************/