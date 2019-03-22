/****************************************************************************************************/

function uploadFileRetrieveParameters()
{
  if(document.getElementById('veilBackground')) return;

  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  document.getElementById('mainContainer').style.filter ='blur(4px)';

  const modalVeil       = document.createElement('div');
  const modalBackground = document.createElement('div');
  const modalContainer  = document.createElement('div');

  modalVeil         .setAttribute('id', 'modalVeil');
  modalBackground   .setAttribute('id', 'modalBackground');
  modalContainer    .setAttribute('id', 'modalContainer');

  modalBackground   .appendChild(modalContainer);
  document.body     .appendChild(modalBackground);
  document.body     .appendChild(modalVeil);

  displayLoader(storageStrings.serviceSection.uploadFilePopup.retrieveParametersLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { serviceUuid: serviceUuid }, timeout: 5000, url: '/queries/storage/services/get-file-upload-parameters',
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('modalVeil').remove();
          document.getElementById('modalBackground').remove();

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'uploadFileError') :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'uploadFileError');
        });
      }
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      const uploadParams = result.uploadParameters;

      return uploadFileOpenPrompt(uploadParams);
    });
  });
}

/****************************************************************************************************/

function uploadFileOpenPrompt(uploadParams)
{
  const maxFileSize = uploadParams.serviceData.maxFileSize / 1024 / 1024 / 1024 >= 1
  ? `${(uploadParams.serviceData.maxFileSize / 1024 / 1024 / 1024).toFixed(2)} Go`
  : uploadParams.serviceData.maxFileSize / 1024 / 1024 >= 1
    ? `${(uploadParams.serviceData.maxFileSize / 1024 / 1024).toFixed(2)} Mo`
    : uploadParams.serviceData.maxFileSize / 1024 >= 1
      ? `${(uploadParams.serviceData.maxFileSize / 1024).toFixed(2)} Ko`
      : `${uploadParams.serviceData.maxFileSize} o`;

  const modal         = document.createElement('div');
  const modalHeader   = document.createElement('div');
  const modalForm     = document.createElement('form');
  const formError     = document.createElement('div');
  const formHelp      = document.createElement('div');
  const formInput     = document.createElement('input');
  const formLabel     = document.createElement('div');
  const formSize      = document.createElement('div');
  const formExt       = document.createElement('div');
  const formButtons   = document.createElement('div');
  const buttonsSubmit = document.createElement('button');
  const buttonsCancel = document.createElement('button');

  modal               .setAttribute('id', 'currentModal');
  modalForm           .setAttribute('id', 'currentModalForm');
  formError           .setAttribute('id', 'currentModalFormError');
  formInput           .setAttribute('id', 'currentModalFormInput');
  formLabel           .setAttribute('id', 'currentModalFormLabel');
  buttonsSubmit       .setAttribute('id', 'currentModalFormSubmit');

  modal               .setAttribute('class', 'serviceUploadFilePopup');
  modalHeader         .setAttribute('class', 'serviceUploadFilePopupHeader');
  modalForm           .setAttribute('class', 'serviceUploadFilePopupForm');
  formError           .setAttribute('class', 'serviceUploadFilePopupFormError');
  formHelp            .setAttribute('class', 'serviceUploadFilePopupFormHelp');
  formInput           .setAttribute('class', 'serviceUploadFilePopupFormInput');
  formLabel           .setAttribute('class', 'serviceUploadFilePopupFormLabel');
  formSize            .setAttribute('class', 'serviceUploadFilePopupFormParams');
  formExt             .setAttribute('class', 'serviceUploadFilePopupFormParams');

  formButtons         .setAttribute('class', 'serviceUploadFilePopupFormButtons');
  buttonsSubmit       .setAttribute('class', 'serviceUploadFilePopupFormButtonsSend');
  buttonsCancel       .setAttribute('class', 'serviceUploadFilePopupFormButtonsCancel');

  formInput           .setAttribute('type', 'file');

  modalHeader         .innerText = storageStrings.serviceSection.uploadFilePopup.title;
  formHelp            .innerText = storageStrings.serviceSection.uploadFilePopup.help;
  formLabel           .innerText = storageStrings.serviceSection.uploadFilePopup.inputPlaceholder;
  buttonsSubmit       .innerText = storageStrings.serviceSection.uploadFilePopup.sendButton;
  buttonsCancel       .innerText = storageStrings.serviceSection.uploadFilePopup.cancelButton;

  formSize            .innerHTML += `<div class="serviceUploadFilePopupFormParamsKey">${storageStrings.serviceSection.uploadFilePopup.maxFileSize} :</div><div class="serviceUploadFilePopupFormParamsValue">${maxFileSize}</div>`;
  formExt             .innerHTML += `<div class="serviceUploadFilePopupFormParamsKey">${storageStrings.serviceSection.uploadFilePopup.authorizedExtensions} :</div><div class="serviceUploadFilePopupFormParamsValue">${Object.values(uploadParams.authorizedExtensions).join(', ').toUpperCase()}</div>`;

  formInput           .addEventListener('change', () => { uploadFileCheckFormat(uploadParams) });
  formLabel           .addEventListener('click', () => { formInput.click() });
  modalForm           .addEventListener('submit', uploadFileSendToServer);

  buttonsCancel       .addEventListener('click', () =>
  {
    event.preventDefault();
    document.getElementById('modalVeil').remove();
    document.getElementById('modalBackground').remove();
    document.getElementById('mainContainer').removeAttribute('style');
  });

  formButtons         .appendChild(buttonsSubmit);
  formButtons         .appendChild(buttonsCancel);

  modalForm           .appendChild(formError);
  modalForm           .appendChild(formHelp);
  modalForm           .appendChild(formInput);
  modalForm           .appendChild(formLabel);
  modalForm           .appendChild(formSize);
  modalForm           .appendChild(formExt);
  modalForm           .appendChild(formButtons);

  modal               .appendChild(modalHeader);
  modal               .appendChild(modalForm);

  document.getElementById('modalContainer').appendChild(modal);
}

/****************************************************************************************************/

function uploadFileCheckFormat(uploadParams)
{
  const currentFilePath = document.getElementById('currentModalFormInput').value;

  document.getElementById('currentModalFormLabel').removeAttribute('style');
  document.getElementById('currentModalFormError').removeAttribute('style');
  document.getElementById('currentModalFormError').innerText = '';

  if(currentFilePath.length === 0)
  {
    document.getElementById('currentModalFormLabel').innerText = storageStrings.serviceSection.uploadFilePopup.inputPlaceholder;

    return document.getElementById('currentModalFormSubmit').removeAttribute('style');
  }

  const currentFileName = currentFilePath.split('\\')[currentFilePath.split('\\').length - 1];
  const currentFile = document.getElementById('currentModalFormInput').files[0];

  document.getElementById('currentModalFormLabel').innerText = currentFileName;

  if(currentFileName.split('.').length < 2 || Object.values(uploadParams.authorizedExtensions).includes(currentFileName.split('.')[currentFileName.split('.').length - 1].toLowerCase()) == false)
  {
    document.getElementById('currentModalFormLabel').style.color = '#D9534F';

    document.getElementById('currentModalFormError').style.display = 'block';
    document.getElementById('currentModalFormError').innerText = storageStrings.serviceSection.uploadFilePopup.errorMessages.unauthorizedExtension;

    return document.getElementById('currentModalFormSubmit').removeAttribute('style');
  }


  if(currentFile.size > uploadParams.serviceData.maxFileSize)
  {
    document.getElementById('currentModalFormLabel').style.color = '#D9534F';

    document.getElementById('currentModalFormError').style.display = 'block';
    document.getElementById('currentModalFormError').innerText = storageStrings.serviceSection.uploadFilePopup.errorMessages.unauthorizedSize;

    return document.getElementById('currentModalFormSubmit').removeAttribute('style');
  }

  document.getElementById('currentModal').style.display = 'none';

  displayLoader(storageStrings.serviceSection.uploadFilePopup.checkingFileLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'PUT', dataType: 'json', data: { serviceUuid: document.getElementById('serviceStorageContainer').getAttribute('name'), currentFolder: document.getElementById('currentServiceFolder').getAttribute('name'), fileName: currentFileName, fileSize: currentFile.size }, timeout: 5000, url: '/queries/storage/services/prepare-upload',
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('currentModal').removeAttribute('style');

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'uploadFileError') :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'uploadFileError');
        });
      }
    }).done((result) =>
    {
      removeLoader(loader, () => {  });

      document.getElementById('currentModal').removeAttribute('style');

      if(result.fileAlreadyExists)
      {
        if(result.hasTheRightToRemove == false) return displayError(storageStrings.serviceSection.uploadFilePopup.errorMessages.unauthorizedToReplace, null, 'uploadFileError');

        return uploadFileOpenReplacementPrompt();
      }

      document.getElementById('currentModalFormSubmit').style.display = 'block';
    });
  });
}

/****************************************************************************************************/

function uploadFileOpenReplacementPrompt()
{
  document.getElementById('currentModal').style.display = 'none';

  var modal                 = document.createElement('div');
  var modalHeader           = document.createElement('div');
  var modalHeaderTitle      = document.createElement('div');
  var modalContent          = document.createElement('div');
  var modalContentButtons   = document.createElement('div');
  var modalContentConfirm   = document.createElement('button');
  var modalContentCancel    = document.createElement('button');

  modal                 .setAttribute('class', 'baseModal');
  modalHeader           .setAttribute('class', 'baseModalHeader');
  modalHeaderTitle      .setAttribute('class', 'baseModalHeaderTitle');
  modalContent          .setAttribute('class', 'baseModalContent');
  modalContentButtons   .setAttribute('class', 'baseModalContentButtons');
  modalContentConfirm   .setAttribute('class', 'baseModalContentButtonsConfirm');
  modalContentCancel    .setAttribute('class', 'baseModalContentButtonsCancel');

  modalHeaderTitle      .innerText = storageStrings.serviceSection.uploadFilePopup.replaceModal.title;
  modalContentConfirm   .innerText = storageStrings.serviceSection.uploadFilePopup.replaceModal.confirm;
  modalContentCancel    .innerText = commonStrings.global.cancel;

  modalContent          .innerHTML = `<div class="baseModalContentMessage">${storageStrings.serviceSection.uploadFilePopup.replaceModal.message}</div>`;

  modalHeader           .appendChild(modalHeaderTitle);
  modalContent          .appendChild(modalContentButtons);
  modalContentButtons   .appendChild(modalContentConfirm);
  modalContentButtons   .appendChild(modalContentCancel);
  modal                 .appendChild(modalHeader);
  modal                 .appendChild(modalContent);

  modalContentConfirm   .addEventListener('click', () =>
  {
    modal.remove();
    document.getElementById('currentModal').removeAttribute('style');
    return uploadFileSendToServer();
  });

  modalContentCancel    .addEventListener('click', () =>
  {
    modal.remove();
    document.getElementById('currentModalFormLabel').innerText = storageStrings.serviceSection.uploadFilePopup.inputPlaceholder;
    document.getElementById('currentModalFormInput').value = '';
    document.getElementById('currentModal').removeAttribute('style');
  });

  document.getElementById('modalContainer').appendChild(modal);
}

/****************************************************************************************************/

function uploadFileSendToServer(event)
{
  if(event) event.preventDefault();

  var speedInterval = null;

  document.getElementById('currentModalForm').style.display = 'none';

  const fileToUpload = document.getElementById('currentModalFormInput').files[0];

  const stringifiedFileSize = (fileToUpload.size / 1024 / 1024 / 1024) > 1
  ? `${(fileToUpload.size / 1024 / 1024 / 1024).toFixed(2)} Go`
  : (fileToUpload.size / 1024 / 1024) > 1
    ? `${(fileToUpload.size / 1024 / 1024).toFixed(2)} Mo`
    : (fileToUpload.size / 1024) > 1
      ? `${(fileToUpload.size / 1024).toFixed(2)} Ko`
      : `${fileToUpload.size} o`;

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  xhr.responseType = 'json';

  data.append('service', document.getElementById('serviceStorageContainer').getAttribute('name'));
  data.append('currentFolder', document.getElementById('currentServiceFolder').getAttribute('name'));
  data.append('file', fileToUpload);

  const block         = document.createElement('div');
  const blockMessage  = document.createElement('div');
  const blockProgress = document.createElement('div');
  const progressKey   = document.createElement('div');
  const progressValue = document.createElement('div');
  const blockSpeed    = document.createElement('div');
  const blockBar      = document.createElement('div');
  const barStatus     = document.createElement('div');
  const barFiller     = document.createElement('div');
  const blockButton   = document.createElement('div');
  const buttonCancel  = document.createElement('button');

  block         .setAttribute('class', 'serviceUploadFilePopupLoader');
  blockMessage  .setAttribute('class', 'serviceUploadFilePopupLoaderMessage');
  blockProgress .setAttribute('class', 'serviceUploadFilePopupLoaderProgress');
  progressKey   .setAttribute('class', 'serviceUploadFilePopupLoaderProgressKey');
  blockSpeed    .setAttribute('class', 'serviceUploadFilePopupLoaderSpeed');
  blockBar      .setAttribute('class', 'serviceUploadFilePopupLoaderBar');
  barStatus     .setAttribute('class', 'serviceUploadFilePopupLoaderBarStatus');
  barFiller     .setAttribute('class', 'serviceUploadFilePopupLoaderBarFiller');
  blockButton   .setAttribute('class', 'serviceUploadFilePopupLoaderButton');

  blockMessage  .innerText = storageStrings.serviceSection.uploadFilePopup.loaderBlock.message;
  progressKey   .innerText = `${storageStrings.serviceSection.uploadFilePopup.loaderBlock.progressKey} :`;
  progressValue .innerText = `0 / ${stringifiedFileSize}`;
  blockSpeed    .innerText = `-- /s`;
  barStatus     .innerText = '0 %';
  buttonCancel  .innerText = commonStrings.global.cancel;

  buttonCancel  .addEventListener('click', () =>
  {
    clearInterval(speedInterval);

    xhr.abort();
    block.remove();
    document.getElementById('currentModalForm').removeAttribute('style');
  });

  blockProgress .appendChild(progressKey);
  blockProgress .appendChild(progressValue);
  blockBar      .appendChild(barFiller);
  blockBar      .appendChild(barStatus);
  blockButton   .appendChild(buttonCancel);
  block         .appendChild(blockMessage);
  block         .appendChild(blockProgress);
  block         .appendChild(blockSpeed);
  block         .appendChild(blockBar);
  block         .appendChild(blockButton);

  document.getElementById('currentModal').appendChild(block);

  const fileSize = fileToUpload.size;
  var currentDataUploaded = 0;
  var previousDataState = 0;

  /************************************************************/

  xhr.upload.addEventListener('loadstart', (event) =>
  {
    speedInterval = setInterval(() =>
    {
      const dataUploadedFromLastLoop = currentDataUploaded - previousDataState;

      blockSpeed.innerText = (dataUploadedFromLastLoop / 1024 / 1024 / 1024) > 1
      ? `${(dataUploadedFromLastLoop / 1024 / 1024 / 1024).toFixed(2)} Go/s`
      : (dataUploadedFromLastLoop / 1024 / 1024) > 1
        ? `${(dataUploadedFromLastLoop / 1024 / 1024).toFixed(2)} Mo/s`
        : (dataUploadedFromLastLoop / 1024) > 1
          ? `${(dataUploadedFromLastLoop / 1024).toFixed(2)} Ko/s`
          : `${dataUploadedFromLastLoop} o/s`;

      previousDataState = currentDataUploaded;

    }, 1000);
  });

  /************************************************************/

  xhr.upload.addEventListener('progress', (event) =>
  {
    currentDataUploaded = event.loaded;

    const dataUploadedSize = (event.loaded / 1024 / 1024 / 1024) > 1
    ? `${(event.loaded / 1024 / 1024 / 1024).toFixed(2)} Go`
    : (event.loaded / 1024 / 1024) > 1
      ? `${(event.loaded / 1024 / 1024).toFixed(2)} Mo`
      : (event.loaded / 1024) > 1
        ? `${(event.loaded / 1024).toFixed(2)} Ko`
        : `${event.loaded} o`;

    progressValue .innerText = `${dataUploadedSize} / ${stringifiedFileSize}`;

    const percentComplete = ((event.loaded / event.total) * 100).toFixed(2);

    barStatus.innerText = `${percentComplete} %`;

    barFiller.style.width = `${percentComplete}%`;

  }, false);

  /************************************************************/

  xhr.ontimeout = () =>
  {
    block.remove();
    document.getElementById('currentModalForm').removeAttribute('style');

    displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'uploadFileError');
  }

  /************************************************************/

  xhr.onload = () =>
  {
    clearInterval(speedInterval);

    if(xhr.status === 200)
    {
      document.getElementById('modalVeil').remove();
      document.getElementById('modalBackground').remove();

      document.getElementById('mainContainer').removeAttribute('style');

      return displaySuccess(xhr.response.message);
    }

    block.remove();

    document.getElementById('currentModalForm').removeAttribute('style');

    return displayError(xhr.response.message, xhr.response.detail, null);
  }

  /************************************************************/

  xhr.open('POST', '/queries/storage/services/upload-file', true);

  xhr.send(data);
}

/****************************************************************************************************/
