/****************************************************************************************************/

function removeSelection(event)
{
  if(document.getElementById('filesContainer') == null) return;

  const currentFiles = document.getElementById('filesContainer').children;

  var filesToRemove = [];

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].children[0].tagName === 'INPUT')
    {
      if(currentFiles[x].children[0].checked) filesToRemove.push({ uuid: currentFiles[x].getAttribute('name'), name: currentFiles[x].children[2].innerText });
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