/****************************************************************************************************/

function removeSelection(event)
{
  if(document.getElementById('currentFolder') == null) return;

  const currentFolderElements = document.getElementById('currentFolder').children;

  var filesToRemove = [];

  for(var x = 0; x < currentFolderElements.length; x++)
  {
    if(currentFolderElements[x].children[0].tagName === 'INPUT')
    {
      if(currentFolderElements[x].children[0].checked) filesToRemove.push({ uuid: currentFolderElements[x].getAttribute('name'), name: currentFolderElements[x].children[2].innerText });
    }
  }

  openConfirmationPrompt(filesToRemove);
}

/****************************************************************************************************/

function openConfirmationPrompt(filesToRemove)
{
  if(filesToRemove.length === 0) return;

  createBackground('removeFilesPopupBackground');

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('removeFilesPopupBackground');

        displayError(error.message, error.detail, null);

        return;
      }

      var popup     = document.createElement('div');
      var content   = document.createElement('div');
      var buttons   = document.createElement('div');
      var confirm   = document.createElement('button');
      var cancel    = document.createElement('button');

      popup         .setAttribute('id', 'removeFilesPopup');

      popup         .setAttribute('class', 'standardPopup');
      content       .setAttribute('class', 'standardPopupContent');
      buttons       .setAttribute('class', 'removeFilesPopupButtons');
      confirm       .setAttribute('class', 'removeFilesPopupConfirm');
      cancel        .setAttribute('class', 'removeFilesPopupCancel');

      confirm       .addEventListener('click', () =>
      {
        confirmSuppression(filesToRemove, strings);
      });

      cancel        .addEventListener('click', () =>
      {
        popup.remove();
        removeBackground('removeFilesPopupBackground');
      });

      popup         .innerHTML += `<div class="standardPopupTitle">${strings.services.popup.remove.title}</div>`;
      content       .innerHTML += `<div class="removeFilesPopupMessage">${strings.services.popup.remove.message}</div>`;

      confirm       .innerText = strings.services.popup.remove.confirm;
      cancel        .innerText = strings.services.popup.remove.cancel;

      for(var x = 0; x < filesToRemove.length; x++)
      {
        content.innerHTML += `<div class="removeFilesPopupFileName">${filesToRemove[x].name}</div>`;
      }

      buttons       .appendChild(confirm);
      buttons       .appendChild(cancel);
      content       .appendChild(buttons);
      popup         .appendChild(content);
      document.body .appendChild(popup);
    });
  });
  /*
  var background      = document.createElement('div');
  var spinner         = document.createElement('div');
  var prompt          = document.createElement('div');
  var title           = document.createElement('div');
  var content         = document.createElement('div');
  var message         = document.createElement('div');
  var confirm         = document.createElement('div');
  var cancel          = document.createElement('div');

  background          .setAttribute('id', 'removePromptBackground');
  prompt              .setAttribute('id', 'removePrompt');
  content             .setAttribute('id', 'removePromptContent');
  confirm             .setAttribute('id', 'removePromptConfirm');
  cancel              .setAttribute('id', 'removePromptCancel');

  background          .setAttribute('class', 'storageBackground');
  spinner             .setAttribute('class', 'storageSpinner');
  prompt              .setAttribute('class', 'removeFilesPrompt');
  title               .setAttribute('class', 'title');
  content             .setAttribute('class', 'content');
  message             .setAttribute('class', 'message');
  confirm             .setAttribute('class', 'confirm');
  cancel              .setAttribute('class', 'cancel');

  spinner             .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  confirm             .innerHTML = '<i class="fas fa-check-circle"></i>';
  cancel              .innerHTML = '<i class="fas fa-times-circle"></i>';

  content             .appendChild(message);

  prompt              .appendChild(title);
  prompt              .appendChild(content);
  prompt              .appendChild(confirm);
  prompt              .appendChild(cancel);

  document.body       .appendChild(spinner);
  document.body       .appendChild(background);

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

    title           .innerText = json.strings.services.popup.remove.title;
    message         .innerText = json.strings.services.popup.remove.message;

    confirm         .addEventListener('click', () => { confirmSuppression(filesToRemove, json.strings); });
    cancel          .addEventListener('click', closeConfirmationPrompt);

    for(var x = 0; x < filesToRemove.length; x++)
    {
      var file      = document.createElement('div');
      file          .innerText = '- ' + filesToRemove[x].name;
      file          .setAttribute('class', 'file');
      content       .appendChild(file);
    }

    document.body       .appendChild(prompt);
  });*/
}

/****************************************************************************************************/

function confirmSuppression(filesToRemove, strings)
{
  if(document.getElementById('removeFilesPopup') == null) return;

  document.getElementById('removeFilesPopup').style.display = 'none';

  displayLoader(strings.services.popup.remove.pending, (loader) =>
  {
    var filesUuid = [];

    for(var x = 0; x < filesToRemove.length; x++)
    {
      filesUuid.push(filesToRemove[x].uuid);
    }

    $.ajax(
    {
      method: 'DELETE', dataType: 'json', timeout: 10000, data: { filesToRemove: JSON.stringify(filesUuid), serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, url: '/queries/storage/services/remove-files',

      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () => {  });

        document.getElementById('removeFilesPopup').removeAttribute('style');

        xhr.responseJSON != undefined
        ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
        : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
      }

    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      removeBackground('removeFilesPopupBackground');
      document.getElementById('removeFilesPopup').remove();

      displaySuccess(result.message, null, null);
    });
  });
}