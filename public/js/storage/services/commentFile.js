/****************************************************************************************************/

var storageAppStrings = null;

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

  
}

/****************************************************************************************************/

function closeFileCommentPopup()
{
  if(document.getElementById('commentPopup')) document.getElementById('commentPopup').remove();
  if(document.getElementById('commentBackground')) document.getElementById('commentBackground').remove();
}

/****************************************************************************************************/