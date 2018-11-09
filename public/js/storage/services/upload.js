/****************************************************************************************************/

if(document.getElementById('uploadFileButton')) document.getElementById('uploadFileButton').addEventListener('click', getUploadParameters);

/****************************************************************************************************/

function getUploadParameters()
{
  if(document.getElementById('uploadFileBackground')) return;

  if(document.getElementById('serviceUuid') == null) return;

  createBackground('uploadFileBackground');

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { serviceUuid: document.getElementById('serviceUuid').getAttribute('name') }, timeout: 5000, url: '/queries/storage/services/get-file-upload-parameters',
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          removeBackground('uploadFileBackground');

          textStatus === 'timeout'
          ? displayCriticalErrorMessage('Erreur', 'Temps de réponse dépassé', `Le serveur doit fournir des informations sur les critères de validation d'un fichier à l'envoi pour ce service (taille maximale des fichiers et extensions autorisées). La récupération de ces données depuis le serveur a échoué.`, `Cette erreur est survenue car l'échange entre le serveur et votre navigateur prenait trop de temps. Ce problème peut arriver si le serveur est dans l'incapacité de traiter votre demande dans les temps ou alors si vous rencontrez un problème de connexion. Veuillez vous assurer que votre connexion est stable et réessayer plus tard.`, 'Fermer')
          : xhr.responseJSON != undefined
            ? displayCriticalErrorMessage(xhr.responseJSON.errorTitle, xhr.responseJSON.errorMessage, xhr.responseJSON.errorDetail, xhr.responseJSON.errorHelp, xhr.responseJSON.errorClose)
            : displayCriticalErrorMessage('Erreur', textStatus, `Le serveur doit fournir des informations sur les critères de validation d'un fichier à l'envoi pour ce service (taille maximale des fichiers et extensions autorisées). La récupération de ces données depuis le serveur a échoué.`, `Le problème semble lié au serveur. Vous ne pouvez pas régler ce problème vous-même cependant vous devriez le signaler pour qu'il puisse être résolu au plus vite.`, 'Fermer');
        });
      }
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        openUploadFilePopup(result.storageAppStrings, result.uploadParameters);
      });
    });
  });
}

/****************************************************************************************************/

function openUploadFilePopup(storageAppStrings, uploadParameters)
{
  var popup             = document.createElement('div');
  var popupTitle        = document.createElement('div');
  var popupContent      = document.createElement('div');
  var popupError        = document.createElement('div');
  var popupHelp         = document.createElement('div');
  var popupInput        = document.createElement('input');
  var popupLabel        = document.createElement('div');
  var popupSize         = document.createElement('div');
  var popupExtensions   = document.createElement('div');
  var popupButtons      = document.createElement('div');
  var popupClose        = document.createElement('button');
  var popupSend         = document.createElement('button');

  popup                 .setAttribute('id', 'uploadFilePopup');
  popupSend             .setAttribute('id', 'uploadFilePopupSend');
  popupContent          .setAttribute('id', 'uploadFilePopupContent');
  popupInput            .setAttribute('id', 'uploadFilePopupInput');
  popupLabel            .setAttribute('id', 'uploadFilePopupFileName');
  popupError            .setAttribute('id', 'uploadFilePopupErrorMessage');

  popup                 .setAttribute('class', 'uploadFilePopup');
  popupTitle            .setAttribute('class', 'uploadFilePopupTitle');
  popupError            .setAttribute('class', 'uploadFilePopupError');
  popupHelp             .setAttribute('class', 'uploadFilePopupInformation');
  popupInput            .setAttribute('class', 'uploadFilePopupInput');
  popupLabel            .setAttribute('class', 'uploadFilePopupInputLabel');
  popupExtensions       .setAttribute('class', 'uploadFilePopupExtensions');
  popupSize             .setAttribute('class', 'uploadFilePopupSize');
  popupButtons          .setAttribute('class', 'uploadFilePopupButtons');
  popupClose            .setAttribute('class', 'uploadFilePopupCancel');
  popupSend             .setAttribute('class', 'uploadFilePopupSend');

  popupInput            .setAttribute('type', 'file');

  popupTitle            .innerText = storageAppStrings.services.detailPage.uploadFilePopup.title;
  popupHelp             .innerText = storageAppStrings.services.detailPage.uploadFilePopup.inputInformation;
  popupLabel            .innerText = storageAppStrings.services.detailPage.uploadFilePopup.inputPlaceholder;
  popupClose            .innerText = storageAppStrings.services.detailPage.uploadFilePopup.cancelButton;
  popupSend             .innerText = storageAppStrings.services.detailPage.uploadFilePopup.sendButton;

  popupExtensions       .innerHTML += `<div class="uploadFilePopupExtensionsLabel">${storageAppStrings.services.detailPage.uploadFilePopup.authorizedExtensions} :</div>`;
  popupExtensions       .innerHTML += `<div class="uploadFilePopupExtensionsValues">${Object.values(uploadParameters.authorizedExtensions)}</div>`;

  popupSize             .innerHTML += `<div class="uploadFilePopupSizelabel">${storageAppStrings.services.detailPage.uploadFilePopup.maxFileSize} :</div>`;

  uploadParameters.serviceData.maxFileSize / 1024 / 1024 / 1024 >= 1

  ? popupSize.innerHTML += `<div class="uploadFilePopupSizeValue">${(uploadParameters.serviceData.maxFileSize / 1024 / 1024 / 1024).toFixed(2)} Go`
  : uploadParameters.serviceData.maxFileSize / 1024 / 1024 >= 1

  ? popupSize.innerHTML += `<div class="uploadFilePopupSizeValue">${(uploadParameters.serviceData.maxFileSize / 1024 / 1024).toFixed(2)} Mo`
  : uploadParameters.serviceData.maxFileSize / 1024 >= 1

  ? popupSize.innerHTML += `<div class="uploadFilePopupSizeValue">${(uploadParameters.serviceData.maxFileSize / 1024).toFixed(2)} Ko`
  : popupSize.innerHTML += `<div class="uploadFilePopupSizeValue">${uploadParameters.serviceData.maxFileSize} o`;

  popupInput            .addEventListener('change', () => { checkBeforeUpload(storageAppStrings) });
  popupLabel            .addEventListener('click', () => { popupInput.click() });
  popupClose            .addEventListener('click', closeUploadFilePopup);
  popupSend             .addEventListener('click', () => { uploadFile(storageAppStrings) });

  popupButtons          .appendChild(popupSend);
  popupButtons          .appendChild(popupClose);
  popupContent          .appendChild(popupError);
  popupContent          .appendChild(popupHelp);
  popupContent          .appendChild(popupInput);
  popupContent          .appendChild(popupLabel);
  popupContent          .appendChild(popupSize);
  popupContent          .appendChild(popupExtensions);
  popupContent          .appendChild(popupButtons);
  popup                 .appendChild(popupTitle);
  popup                 .appendChild(popupContent);
  document.body         .appendChild(popup);
}

/****************************************************************************************************/

function closeUploadFilePopup()
{
  if(document.getElementById('uploadFilePopup')) document.getElementById('uploadFilePopup').remove();
  removeBackground('uploadFileBackground');
}

/****************************************************************************************************/

function checkBeforeUpload(storageAppStrings)
{
  if(document.getElementById('uploadFilePopupSend') == null) return;
  if(document.getElementById('uploadFilePopupInput') == null) return;
  if(document.getElementById('uploadFilePopupContent') == null) return;
  if(document.getElementById('uploadFilePopupFileName') == null) return;
  if(document.getElementById('uploadFilePopupErrorMessage') == null) return;

  document.getElementById('uploadFilePopup').style.display = 'none';
  document.getElementById('uploadFilePopupSend').removeAttribute('style');
  document.getElementById('uploadFilePopupErrorMessage').removeAttribute('style');

  const filePath = document.getElementById('uploadFilePopupInput').value;
  const fileName = filePath.split('\\')[filePath.split('\\').length - 1];

  document.getElementById('uploadFilePopupFileName').innerText = fileName;

  displayLoader(storageAppStrings.services.detailPage.uploadFilePopup.checkingFormat, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { serviceUuid: document.getElementById('serviceUuid').getAttribute('name'), currentFolder: document.getElementById('currentFolder').getAttribute('name'), fileName: fileName, fileSize: document.getElementById('uploadFilePopupInput').files[0].size }, timeout: 5000, url: '/queries/storage/services/prepare-upload',
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('uploadFilePopup').removeAttribute('style');

          xhr.responseJSON == undefined
          ? displayError('Temps de réponse dépassé', null, 'uploadPopupError')
          : displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'uploadPopupError');
        });
      }
    }).done((result) =>
    {
      removeLoader(loader, () =>
      {
        if(result.fileAlreadyExists)
        {
          if(result.hasTheRightToRemove == false)
          {
            document.getElementById('uploadFilePopup').removeAttribute('style');

            displayError(storageAppStrings.services.detailPage.uploadFilePopup.hasNoRightToReplaceExistingFile, null, 'uploadPopupError');
            return;
          }

          return displayReplaceFilePopup(storageAppStrings)
        }

        document.getElementById('uploadFilePopup').removeAttribute('style');
        document.getElementById('uploadFilePopupSend').style.display = 'block';
      });
    });
  });
}

/****************************************************************************************************/

function displayReplaceFilePopup(storageAppStrings)
{
  var replacePopup          = document.createElement('div');
  var replacePopupButtons   = document.createElement('div');
  var replacePopupConfirm   = document.createElement('button');
  var replacePopupCancel    = document.createElement('button');

  replacePopup              .setAttribute('class', 'standardPopup');
  replacePopupButtons       .setAttribute('class', 'replaceFilePopupButtons');
  replacePopupConfirm       .setAttribute('class', 'replaceFilePopupConfirm');
  replacePopupCancel        .setAttribute('class', 'replaceFilePopupCancel');

  replacePopup              .innerHTML += `<div class="standardPopupTitle">${storageAppStrings.services.detailPage.uploadFilePopup.replaceFileTitle}</div>`;
  replacePopup              .innerHTML += `<div class="standardPopupMessage">${storageAppStrings.services.detailPage.uploadFilePopup.replaceFileMessage}</div>`;

  replacePopupConfirm       .innerText = storageAppStrings.services.detailPage.uploadFilePopup.replaceFileConfirm;
  replacePopupCancel        .innerText = storageAppStrings.services.detailPage.uploadFilePopup.replaceFileCancel;

  replacePopupConfirm       .addEventListener('click', () =>
  {
    replacePopup.remove();
    uploadFile(storageAppStrings);
  });
  
  replacePopupCancel        .addEventListener('click', () =>
  {
    replacePopup.remove();
    document.getElementById('uploadFilePopupInput').value = '';
    document.getElementById('uploadFilePopupFileName').innerText = storageAppStrings.services.detailPage.uploadFilePopup.inputPlaceholder;
    document.getElementById('uploadFilePopup').removeAttribute('style');
  });

  replacePopupButtons       .appendChild(replacePopupConfirm);
  replacePopupButtons       .appendChild(replacePopupCancel);
  replacePopup              .appendChild(replacePopupButtons);
  document.body             .appendChild(replacePopup);
}

/****************************************************************************************************/

function uploadFile(storageAppStrings)
{
  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  xhr.responseType = 'json';

  data.append('service', document.getElementById('serviceUuid').getAttribute('name'));
  data.append('currentFolder', document.getElementById('currentFolder').getAttribute('name'));
  data.append('file', document.getElementById('uploadFilePopupInput').files[0]);

  document.getElementById('uploadFilePopupContent').style.display = 'none';
  document.getElementById('uploadFilePopup').removeAttribute('style');

  var progressBlock                 = document.createElement('div');
  var progressBlockStatus           = document.createElement('div');
  var progressBlockStatusCog        = document.createElement('div');
  var progressBlockStatusBar        = document.createElement('div');
  var progressBlockStatusBarFill    = document.createElement('div');
  var progressBlockStatusBarValue   = document.createElement('div');
  var progressBlockCancel           = document.createElement('button');

  progressBlock               .setAttribute('class', 'uploadFilePopupProgressBlock');
  progressBlockStatus         .setAttribute('class', 'uploadFilePopupProgressBlockStatus');
  progressBlockStatusCog      .setAttribute('class', 'uploadFilePopupProgressBlockStatusCog');
  progressBlockStatusBar      .setAttribute('class', 'uploadFilePopupProgressBlockStatusBar');
  progressBlockStatusBarFill  .setAttribute('class', 'uploadFilePopupProgressBlockStatusBarFill');
  progressBlockStatusBarValue .setAttribute('class', 'uploadFilePopupProgressBlockStatusBarValue');
  progressBlockCancel         .setAttribute('class', 'uploadFilePopupProgressBlockCancel');

  progressBlockStatusCog      .innerHTML = `<i class="fas fa-cog fa-spin"></i>`;
  progressBlockStatusBarValue .innerText = '0 %';
  progressBlockCancel         .innerText = storageAppStrings.services.detailPage.uploadFilePopup.cancelButton;

  progressBlockCancel         .addEventListener('click', () =>
  {
    xhr.abort();
    progressBlock.remove();
    document.getElementById('uploadFilePopupContent').removeAttribute('style');
  });

  progressBlockStatusBar      .appendChild(progressBlockStatusBarFill);
  progressBlockStatusBar      .appendChild(progressBlockStatusBarValue);
  progressBlockStatus         .appendChild(progressBlockStatusCog);
  progressBlockStatus         .appendChild(progressBlockStatusBar);
  progressBlock               .appendChild(progressBlockStatus);
  progressBlock               .appendChild(progressBlockCancel);

  document.getElementById('uploadFilePopup').appendChild(progressBlock);

  xhr.upload.addEventListener('progress', (event) => 
  {
    if(event.lengthComputable) 
    {
      var percentComplete = ((event.loaded / event.total) * 100).toFixed(2);
      
      progressBlockStatusBarValue.innerText = `${percentComplete} %`;

      progressBlockStatusBarFill.style.width = `${percentComplete}%`;
    }

    else 
    {
      progressBlockStatusBarValue.innerText = '?';
    }
  }, false);

  xhr.open('POST', '/queries/storage/services/upload-file', true);

  xhr.send(data);

  xhr.ontimeout = () =>
  {
    progressBlock.remove();
    document.getElementById('uploadFilePopupContent').removeAttribute('style');

    displayError('La requête a expiré, veuillez réessayer plus tard', null, null);
  }

  xhr.onload = () =>
  {
    if(xhr.status === 200)
    {
      document.getElementById('uploadFilePopup').remove();

      removeBackground('uploadFileBackground');

      displaySuccess(xhr.response.message);
    }

    else
    {
      progressBlock.remove();
      document.getElementById('uploadFilePopupContent').removeAttribute('style');

      displayError(xhr.response.message, xhr.response.detail, null);
    }
  }
}

/****************************************************************************************************/