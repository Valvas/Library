/****************************************************************************************************/

var storageAppStrings = null;

/****************************************************************************************************/

function prepareCommentPopup(fileUuid)
{
  if(document.getElementById('addCommentOnFileBackground')) return;

  createBackground('addCommentOnFileBackground');

  displayLoader('', (loader) =>
  {
    if(storageAppStrings != null)
    {
      removeLoader(loader, () => {  });
      
      return openCommentPopup(fileUuid);
    }

    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('addCommentOnFileBackground');

        return displayError(error.message, error.detail, 'addCommentOnFileError');
      }

      return openCommentPopup(fileUuid);
    });
  });
}

/****************************************************************************************************/

function openCommentPopup(fileUuid)
{
  var popup = document.createElement('div');

  popup.setAttribute('name', fileUuid);
  popup.setAttribute('class', 'addCommentOnFilePopup');

  popup.innerHTML += `<div class="addCommentOnFilePopupTitle">Title</div>`;
  popup.innerHTML += `<div class="addCommentOnFilePopupHelp">Help message</div>`;
  popup.innerHTML += `<textarea class="addCommentOnFilePopupInput">Comment content</textarea>`;

  document.body.appendChild(popup);
}

  /*var background    = document.createElement('div');
  var spinner       = document.createElement('div');

  background        .setAttribute('class', 'storageBackground');
  spinner           .setAttribute('class', 'storageSpinner');

  background        .setAttribute('id', 'commentBackground');

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

      xhr.responseJSON != undefined
      ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    const strings = json.strings;

    $.ajax(
    {
      method: 'PUT',
      dataType: 'json',
      timeout: 5000,
      data: { serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
      url: '/queries/storage/services/get-rights-for-service',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        spinner.remove();
        background.remove();
  
        xhr.responseJSON != undefined
        ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
        : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
  
    }).done((json) =>
    {
      spinner.remove();
  
      if(json.rights.comment === 0)
      {
        background.remove();
        displayErrorMessage(strings.services.commentPopup.notAuthorizedToPostComments, null);
      }

      else
      {
        var popup           = document.createElement('div');
        var popupTitle      = document.createElement('div');
        var popupLabel      = document.createElement('div');
        var popupHelp       = document.createElement('div');
        var popupInput      = document.createElement('textarea');
        var popupSend       = document.createElement('button');
        var popupCancel     = document.createElement('button');

        popup               .setAttribute('class', 'storagePopup');
        popupTitle          .setAttribute('class', 'storagePopupTitle');
        popupLabel          .setAttribute('class', 'commentPopupLabel');
        popupInput          .setAttribute('class', 'commentPopupArea');
        popupHelp           .setAttribute('class', 'commentPopupHelp');
        popupSend           .setAttribute('class', 'commentPopupSend');
        popupCancel         .setAttribute('class', 'commentPopupCancel');

        popup               .setAttribute('id', 'commentPopup');
        popupInput          .setAttribute('id', 'commentPopupInput');

        popupInput          .setAttribute('rows', '4');
        popupInput          .setAttribute('maxlength', '256');
        popupInput          .setAttribute('placeholder', strings.services.commentPopup.placeholder);

        popupTitle          .innerText = strings.services.commentPopup.title;
        popupLabel          .innerText = strings.services.commentPopup.label;
        popupHelp           .innerText = strings.services.commentPopup.help;
        popupSend           .innerText = strings.services.commentPopup.send;
        popupCancel         .innerText = strings.services.commentPopup.cancel;

        popupCancel         .addEventListener('click', closeFileCommentPopup);
        popupSend           .addEventListener('click', sendFileComment);
        popupInput          .addEventListener('focus', () => { popupInput.removeAttribute('style'); });

        popup               .appendChild(popupTitle);
        popup               .appendChild(popupLabel);
        popup               .appendChild(popupInput);
        popup               .appendChild(popupHelp);
        popup               .appendChild(popupSend);
        popup               .appendChild(popupCancel);

        document.body       .appendChild(popup);

        popupInput.focus();
      }
    });
  });*/

/****************************************************************************************************/

function sendFileComment()
{
  const fileComment = document.getElementById('commentPopupInput').value;

  if(new RegExp('^(\\S)+(( )?(\\S)+)*$').test(fileComment) == false)
  {
    if(document.getElementById('commentPopupInput')) document.getElementById('commentPopupInput').style.border = '1px solid #D9534F';
  }

  else
  {
    document.getElementById('commentPopup').remove();

    var spinner       = document.createElement('div');

    spinner           .setAttribute('class', 'storageSpinner');
    spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    document.body     .appendChild(spinner);

    $.ajax(
    {
      method: 'POST',
      dataType: 'json',
      timeout: 5000,
      data: { fileComment: fileComment, serviceUuid: document.getElementById('mainBlock').getAttribute('name'), fileUuid: document.getElementById('elementDetailBlock').getAttribute('name') },
      url: '/queries/storage/services/post-file-comment',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        spinner.remove();
        if(document.getElementById('commentBackground')) document.getElementById('commentBackground').remove();
  
        xhr.responseJSON != undefined
        ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
        : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
  
    }).done((json) =>
    {
      spinner.remove();
      if(document.getElementById('commentBackground')) document.getElementById('commentBackground').remove();

      socket.emit('storageAppServicesFileCommented', document.getElementById('elementDetailBlock').getAttribute('name'), document.getElementById('mainBlock').getAttribute('name'));

      displaySuccessMessage(json.message, null);
    });
  }
}

/****************************************************************************************************/

function closeFileCommentPopup()
{
  if(document.getElementById('commentPopup')) document.getElementById('commentPopup').remove();
  if(document.getElementById('commentBackground')) document.getElementById('commentBackground').remove();
}

/****************************************************************************************************/