/****************************************************************************************************/

var storageAppStrings = null;

/****************************************************************************************************/
/* CREATE COMMENT */
/****************************************************************************************************/

function commentFileGetStrings(fileUuid)
{
  if(document.getElementById('addCommentOnFileBackground')) return;

  createBackground('addCommentOnFileBackground');

  if(storageAppStrings != null) return commentFileCreatePopup(fileUuid);

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('addCommentOnFileBackground');

        return displayError(error.message, error.detail, 'addCommentOnFileError');
      }

      return commentFileCreatePopup(fileUuid);
    });
  });
}

/****************************************************************************************************/

function commentFileCreatePopup(fileUuid)
{
  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'addCommentOnFilePopup');
  popup       .setAttribute('class', 'addCommentOnFilePopup');
  buttons     .setAttribute('class', 'addCommentOnFileButtons');
  confirm     .setAttribute('class', 'addCommentOnFileSave');
  cancel      .setAttribute('class', 'addCommentOnFileCancel');

  popup       .innerHTML += `<div class="addCommentOnFilePopupTitle">${storageAppStrings.services.detailPage.commentPopup.title}</div>`;
  popup       .innerHTML += `<div class="addCommentOnFilePopupHelp">${storageAppStrings.services.detailPage.commentPopup.help}</div>`;
  popup       .innerHTML += `<div id="addCommentOnFilePopupError" class="addCommentOnFilePopupError">${storageAppStrings.services.detailPage.commentPopup.formatError}</div>`;
  popup       .innerHTML += `<textarea id="addCommentOnFileInput" placeholder="${storageAppStrings.services.detailPage.commentPopup.placeholder}" class="addCommentOnFilePopupInput"></textarea>`;

  confirm     .innerText = storageAppStrings.services.detailPage.commentPopup.confirm;
  cancel      .innerText = storageAppStrings.services.detailPage.commentPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    commentFileOpenConfirmation(fileUuid);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('addCommentOnFileBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);

  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function commentFileOpenConfirmation(fileUuid)
{
  if(document.getElementById('addCommentOnFileInput') == null) return;

  document.getElementById('addCommentOnFilePopupError').removeAttribute('style');

  if(new RegExp('^(\\S)+(( )?(\\S)+)*$').test(document.getElementById('addCommentOnFileInput').value) == false) return document.getElementById('addCommentOnFilePopupError').style.display = 'block';

  document.getElementById('addCommentOnFilePopup').style.display = 'none';

  var popup     = document.createElement('div');
  var confirm   = document.createElement('button');
  var cancel    = document.createElement('button');

  popup         .setAttribute('class', 'standardPopup');
  confirm       .setAttribute('class', 'standardPopupConfirm');
  cancel        .setAttribute('class', 'standardPopupCancel');

  confirm       .innerText = storageAppStrings.services.detailPage.commentPopup.confirmationPopup.confirm;
  cancel        .innerText = storageAppStrings.services.detailPage.commentPopup.confirmationPopup.cancel;

  popup         .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.detailPage.commentPopup.confirmationPopup.title}</div>`;
  popup         .innerHTML += `<div class="standardPopupMessage">${storageAppStrings.services.detailPage.commentPopup.confirmationPopup.message}</div>`;

  confirm       .addEventListener('click', () =>
  {
    popup.remove();

    return commentFileSendDataToServer(fileUuid);
  });

  cancel        .addEventListener('click', () =>
  {
    popup.remove();
    document.getElementById('addCommentOnFilePopup').removeAttribute('style');
  });

  popup         .appendChild(confirm);
  popup         .appendChild(cancel);

  document.body .appendChild(popup);
}

/****************************************************************************************************/

function commentFileSendDataToServer(fileUuid)
{
  if(document.getElementById('addCommentOnFileInput') == null) return;

  displayLoader(storageAppStrings.services.detailPage.commentPopup.savingMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', timeout: 10000, data: { fileUuid: fileUuid, fileComment: document.getElementById('addCommentOnFileInput').value }, url: '/queries/storage/services/post-file-comment',
      
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });
  
        document.getElementById('addCommentOnFilePopup').removeAttribute('style');
  
        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createCommentOnFileError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'createCommentOnFileError');
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('addCommentOnFilePopup').remove();
  
        removeBackground('addCommentOnFileBackground');
  
        displaySuccess(result.message, null, null);
      });
    });
  });
}

/****************************************************************************************************/
/* REMOVE COMMENT */
/****************************************************************************************************/

function removeCommentGetStrings(commentUuid)
{
  if(document.getElementById('removeCommentOnFileBackground')) return;

  createBackground('removeCommentOnFileBackground');

  if(storageAppStrings != null) return removeCommentCreatePopup(commentUuid);

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('removeCommentOnFileBackground');

        return displayError(error.message, error.detail, 'removeCommentOnFileError');
      }

      return removeCommentCreatePopup(commentUuid);
    });
  });
}

/****************************************************************************************************/

function removeCommentCreatePopup(commentUuid)
{
  var popup   = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('class', 'standardPopup');
  popup       .setAttribute('id', 'removeCommentOnFilePopup');

  confirm     .setAttribute('class', 'standardPopupConfirm');
  cancel      .setAttribute('class', 'standardPopupCancel');

  popup       .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.detailPage.fileAsideLogs.removeCommentPopup.title}</div>`;
  popup       .innerHTML += `<div class="standardPopupMessage">${storageAppStrings.services.detailPage.fileAsideLogs.removeCommentPopup.message}</div>`;

  confirm     .innerText = storageAppStrings.services.detailPage.fileAsideLogs.removeCommentPopup.confirm;
  cancel      .innerText = storageAppStrings.services.detailPage.fileAsideLogs.removeCommentPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    popup.remove();
    removeCommentSendToServer(commentUuid);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('removeCommentOnFileBackground');
  });

  popup       .appendChild(confirm);
  popup       .appendChild(cancel);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function removeCommentSendToServer(commentUuid)
{
  displayLoader(storageAppStrings.services.detailPage.fileAsideLogs.removeCommentPopup.saving, (loader) =>
  {
    $.ajax(
    {
      method: 'DELETE', dataType: 'json', timeout: 10000, data: { commentUuid: commentUuid, serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, url: '/queries/storage/services/remove-file-comment',
      
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });
  
        removeBackground('removeCommentOnFileBackground');
  
        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'createForlderServerError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'createForlderServerError');
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        removeBackground('removeCommentOnFileBackground');
  
        displaySuccess(result.message, null, null);
      });
    });
  });
}

/****************************************************************************************************/
/* UPDATE COMMENT */
/****************************************************************************************************/

function updateCommentGetStrings(commentUuid)
{
  if(document.getElementById('updateCommentOnFileBackground')) return;

  createBackground('updateCommentOnFileBackground');

  if(storageAppStrings != null) return updateCommentCreatePopup(commentUuid);

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('updateCommentOnFileBackground');

        return displayError(error.message, error.detail, 'updateCommentOnFileError');
      }

      return updateCommentCreatePopup(commentUuid);
    });
  });
}

/****************************************************************************************************/

function updateCommentCreatePopup(commentUuid)
{
  if(document.getElementById('fileDetailAsideLogsList') == null) return;

  const fileLogs = document.getElementById('fileDetailAsideLogsList').children;

  var currentCommentContent = null;

  for(var x = 0; x < fileLogs.length; x++)
  {
    if(fileLogs[x].getAttribute('name') === commentUuid) currentCommentContent = fileLogs[x].children[2].innerText;
  }

  var popup   = document.createElement('div');
  var buttons = document.createElement('div');
  var confirm = document.createElement('button');
  var cancel  = document.createElement('button');

  popup       .setAttribute('id', 'updateCommentOnFilePopup');
  popup       .setAttribute('class', 'addCommentOnFilePopup');
  buttons     .setAttribute('class', 'addCommentOnFileButtons');
  confirm     .setAttribute('class', 'addCommentOnFileSave');
  cancel      .setAttribute('class', 'addCommentOnFileCancel');

  popup       .innerHTML += `<div class="addCommentOnFilePopupTitle">${storageAppStrings.services.detailPage.commentPopup.update}</div>`;
  popup       .innerHTML += `<div class="addCommentOnFilePopupHelp">${storageAppStrings.services.detailPage.commentPopup.help}</div>`;
  popup       .innerHTML += `<div id="updateCommentOnFilePopupError" class="addCommentOnFilePopupError">${storageAppStrings.services.detailPage.commentPopup.formatError}</div>`;
  popup       .innerHTML += `<textarea id="updateCommentOnFileInput" placeholder="${storageAppStrings.services.detailPage.commentPopup.placeholder}" class="addCommentOnFilePopupInput">${currentCommentContent}</textarea>`;

  confirm     .innerText = storageAppStrings.services.detailPage.commentPopup.confirm;
  cancel      .innerText = storageAppStrings.services.detailPage.commentPopup.cancel;

  confirm     .addEventListener('click', () =>
  {
    updateCommentOpenConfirmation(commentUuid);
  });

  cancel      .addEventListener('click', () =>
  {
    popup.remove();
    removeBackground('updateCommentOnFileBackground');
  });

  buttons     .appendChild(confirm);
  buttons     .appendChild(cancel);

  popup       .appendChild(buttons);

  document.body.appendChild(popup);
}

/****************************************************************************************************/

function updateCommentOpenConfirmation(commentUuid)
{
  if(document.getElementById('updateCommentOnFileInput') == null) return;

  document.getElementById('updateCommentOnFilePopupError').removeAttribute('style');

  if(new RegExp('^(\\S)+(( )?(\\S)+)*$').test(document.getElementById('updateCommentOnFileInput').value) == false) return document.getElementById('updateCommentOnFilePopupError').style.display = 'block';

  document.getElementById('updateCommentOnFilePopup').style.display = 'none';

  var popup     = document.createElement('div');
  var confirm   = document.createElement('button');
  var cancel    = document.createElement('button');

  popup         .setAttribute('class', 'standardPopup');
  confirm       .setAttribute('class', 'standardPopupConfirm');
  cancel        .setAttribute('class', 'standardPopupCancel');

  confirm       .innerText = storageAppStrings.services.detailPage.commentPopup.confirmationPopup.confirm;
  cancel        .innerText = storageAppStrings.services.detailPage.commentPopup.confirmationPopup.cancel;

  popup         .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.detailPage.commentPopup.confirmationPopup.title}</div>`;
  popup         .innerHTML += `<div class="standardPopupMessage">${storageAppStrings.services.detailPage.commentPopup.confirmationPopup.updateMessage}</div>`;

  confirm       .addEventListener('click', () =>
  {
    popup.remove();

    return updateCommentSendDataToServer(commentUuid);
  });

  cancel        .addEventListener('click', () =>
  {
    popup.remove();
    document.getElementById('updateCommentOnFilePopup').removeAttribute('style');
  });

  popup         .appendChild(confirm);
  popup         .appendChild(cancel);

  document.body .appendChild(popup);
}

/****************************************************************************************************/

function updateCommentSendDataToServer(commentUuid)
{
  if(document.getElementById('updateCommentOnFileInput') == null) return;

  displayLoader(storageAppStrings.services.detailPage.commentPopup.savingMessage, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', timeout: 10000, data: { commentUuid: commentUuid, serviceUuid: document.getElementById('serviceUuid').getAttribute('name'), newCommentContent: document.getElementById('updateCommentOnFileInput').value }, url: '/queries/storage/services/update-file-comment',
      
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });
  
        document.getElementById('updateCommentOnFilePopup').removeAttribute('style');
  
        xhr.responseJSON != undefined ?
        displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'updateCommentOnFileError') :
        displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'updateCommentOnFileError');
      }
  
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        document.getElementById('updateCommentOnFilePopup').remove();
  
        removeBackground('updateCommentOnFileBackground');
  
        displaySuccess(result.message, null, null);
      });
    });
  });
}

/****************************************************************************************************/