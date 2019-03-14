/****************************************************************************************************/

function downloadFiles(event)
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

  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  var filesToDownload = {};

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getElementsByTagName('input').length === 0) continue;

    if(currentFiles[x].getElementsByTagName('input')[0].checked) filesToDownload[currentFiles[x].getAttribute('name')] = currentFiles[x].children[currentFiles[x].children.length - 1].innerText;
  }

  displayLoader(storageStrings.serviceSection.downloadFilesPopup.retrieveFilesDataLoader, (loader) =>
  {
    $.ajax(
    {
      method: 'POST', dataType: 'json', data: { filesToDownload: Object.keys(filesToDownload).join(), serviceUuid: serviceUuid }, timeout: 5000, url: '/queries/storage/services/get-files-data',
      error: (xhr, textStatus, errorThrown) =>
      {
        removeLoader(loader, () =>
        {
          document.getElementById('modalVeil').remove();
          document.getElementById('modalBackground').remove();

          document.getElementById('mainContainer').removeAttribute('style');

          xhr.responseJSON != undefined ?
          displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'downloadFilesError') :
          displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'downloadFilesError');
        });
      }
    }).done((filesData) =>
    {
      removeLoader(loader, () => {  });

      for(var file in filesData)
      {
        if(filesData[file].fileName == undefined) filesData[file].fileName = filesToDownload[file];
      }

      return downloadFilesCreateModal(filesData);
    });
  });
}

/****************************************************************************************************/

function downloadFilesCreateModal(filesToDownload)
{
  var filesThatCanBeDownloadedCounter = 0;
  var remainingFilesToDownload = {};

  const modal           = document.createElement('div');
  const modalHeader     = document.createElement('div');
  const modalContent    = document.createElement('div');
  const contentInfo     = document.createElement('div');
  const contentButtons  = document.createElement('div');
  const buttonsNext     = document.createElement('button');
  const buttonsCancel   = document.createElement('button');

  modal           .setAttribute('class', 'serviceDownloadFilesPopup');
  modalHeader     .setAttribute('class', 'serviceDownloadFilesPopupHeader');
  modalContent    .setAttribute('class', 'serviceDownloadFilesSummary');
  contentInfo     .setAttribute('class', 'serviceDownloadFilesSummaryInfo');
  contentButtons  .setAttribute('class', 'serviceDownloadFilesSummaryButtons');
  buttonsNext     .setAttribute('class', 'serviceDownloadFilesSummaryButtonsStart');
  buttonsCancel   .setAttribute('class', 'serviceDownloadFilesSummaryButtonsCancel');

  for(var file in filesToDownload)
  {
    var fileSize = filesToDownload[file].fileSize == undefined
    ? null
    : (filesToDownload[file].fileSize / 1024 / 1024 / 1024) > 1
      ? `${(filesToDownload[file].fileSize / 1024 / 1024 / 1024).toFixed(2)} Go`
      : (filesToDownload[file].fileSize / 1024 / 1024) > 1
        ? `${(filesToDownload[file].fileSize / 1024 / 1024).toFixed(2)} Mo`
        : (filesToDownload[file].fileSize / 1024) > 1
          ? `${(filesToDownload[file].fileSize / 1024).toFixed(2)} Ko`
          : `${filesToDownload[file].fileSize} o`;

    const currentFile = document.createElement('div');

    filesToDownload[file].fileFoundInDatabase && filesToDownload[file].fileFoundOnStorage
    ? currentFile .setAttribute('class', 'serviceDownloadFilesSummaryFileFound')
    : currentFile .setAttribute('class', 'serviceDownloadFilesSummaryFileMissing');

    currentFile   .innerHTML += `<div class="serviceDownloadFilesSummaryFileName">${filesToDownload[file].fileName}</div>`;

    currentFile   .innerHTML += filesToDownload[file].fileFoundInDatabase == false
    ? `<div class="serviceDownloadFilesSummaryFileStatus">${storageStrings.serviceSection.downloadFilesPopup.summaryFileNotFoundInDatabase}</div>`
    : filesToDownload[file].fileFoundOnStorage == false
      ? `<div class="serviceDownloadFilesSummaryFileStatus">${storageStrings.serviceSection.downloadFilesPopup.summaryFileNotFoundOnStorage}</div>`
      : `<div class="serviceDownloadFilesSummaryFileStatus">${fileSize}</div>`;

    modalContent  .appendChild(currentFile);

    if(filesToDownload[file].fileFoundInDatabase && filesToDownload[file].fileFoundOnStorage)
    {
      filesThatCanBeDownloadedCounter += 1;
      remainingFilesToDownload[file] = filesToDownload[file];
    }
  }

  modalHeader     .innerText = storageStrings.serviceSection.downloadFilesPopup.modalHeader;
  contentInfo     .innerText = `${storageStrings.serviceSection.downloadFilesPopup.summaryInfo} :`;
  buttonsNext     .innerText = storageStrings.serviceSection.downloadFilesPopup.startButton.replace('$[1]', filesThatCanBeDownloadedCounter);
  buttonsCancel   .innerText = commonStrings.global.cancel;

  buttonsNext     .addEventListener('click', () =>
  {
    modal.remove();
    return downloadFilesStartProcess(remainingFilesToDownload);
  });

  buttonsCancel   .addEventListener('click', () =>
  {
    document.getElementById('modalVeil').remove();
    document.getElementById('modalBackground').remove();
    document.getElementById('mainContainer').removeAttribute('style');
  });

  if(filesThatCanBeDownloadedCounter > 0) contentButtons.appendChild(buttonsNext);

  contentButtons  .appendChild(buttonsCancel);
  modalContent    .insertBefore(contentInfo, modalContent.children[0]);
  modalContent    .appendChild(contentButtons);
  modal           .appendChild(modalHeader);
  modal           .appendChild(modalContent);

  document.getElementById('modalContainer').appendChild(modal);
}

/****************************************************************************************************/

function downloadFilesStartProcess(filesToDownload)
{
  const serviceUuid = document.getElementById('serviceStorageContainer').getAttribute('name');

  var speedInterval = null;
  var totalDataSize = 0;
  var processedData = 0;

  for(var file in filesToDownload) totalDataSize += filesToDownload[file].fileSize;

  const stringifiedTotalDataSize = (totalDataSize / 1024 / 1024 / 1024) > 1
  ? `${(totalDataSize / 1024 / 1024 / 1024).toFixed(2)} Go`
  : (totalDataSize / 1024 / 1024) > 1
    ? `${(totalDataSize / 1024 / 1024).toFixed(2)} Mo`
    : (totalDataSize / 1024) > 1
      ? `${(totalDataSize / 1024).toFixed(2)} Ko`
      : `${totalDataSize} o`;

  /************************************************************/

  var xhr = null;
  var formData = null;

  /************************************************************/

  const modal             = document.createElement('div');
  const modalHeader       = document.createElement('div');
  const modalContent      = document.createElement('div');
  const contentCurrent    = document.createElement('div');
  const currentHeader     = document.createElement('div');
  const currentSize       = document.createElement('div');
  const currentSizeKey    = document.createElement('div');
  const currentSizeValue  = document.createElement('div');
  const currentSpeed      = document.createElement('div');
  const currentSpeedKey   = document.createElement('div');
  const currentSpeedValue = document.createElement('div');
  const currentBar        = document.createElement('div');
  const currentBarStatus  = document.createElement('div');
  const currentBarFiller  = document.createElement('div');
  const contentTotal      = document.createElement('div');
  const totalHeader       = document.createElement('div');
  const totalSize         = document.createElement('div');
  const totalSizeKey      = document.createElement('div');
  const totalSizeValue    = document.createElement('div');
  const totalBar          = document.createElement('div');
  const totalBarStatus    = document.createElement('div');
  const totalBarFiller    = document.createElement('div');
  const contentButton     = document.createElement('div');
  const buttonCancel      = document.createElement('button');

  modal               .setAttribute('class', 'serviceDownloadFilesPopup');
  modalHeader         .setAttribute('class', 'serviceDownloadFilesPopupHeader');
  modalContent        .setAttribute('class', 'serviceDownloadFilesProcess');
  contentCurrent      .setAttribute('class', 'serviceDownloadFilesProcessBlock');
  currentHeader       .setAttribute('class', 'serviceDownloadFilesProcessBlockHeader');
  currentSize         .setAttribute('class', 'serviceDownloadFilesProcessParam');
  currentSizeKey      .setAttribute('class', 'serviceDownloadFilesProcessParamKey');
  currentSpeed        .setAttribute('class', 'serviceDownloadFilesProcessParam');
  currentSpeedKey     .setAttribute('class', 'serviceDownloadFilesProcessParamKey');
  currentBar          .setAttribute('class', 'serviceDownloadFilesProcessBar');
  currentBarStatus    .setAttribute('class', 'serviceDownloadFilesProcessBarStatus');
  currentBarFiller    .setAttribute('class', 'serviceDownloadFilesProcessBarFiller');

  contentTotal        .setAttribute('class', 'serviceDownloadFilesProcessBlock');
  totalHeader         .setAttribute('class', 'serviceDownloadFilesProcessBlockHeader');
  totalSize           .setAttribute('class', 'serviceDownloadFilesProcessParam');
  totalSizeKey        .setAttribute('class', 'serviceDownloadFilesProcessParamKey');
  totalBar            .setAttribute('class', 'serviceDownloadFilesProcessBar');
  totalBarStatus      .setAttribute('class', 'serviceDownloadFilesProcessBarStatus');
  totalBarFiller      .setAttribute('class', 'serviceDownloadFilesProcessBarFiller');

  contentButton       .setAttribute('class', 'serviceDownloadFilesProcessButton');

  modalHeader         .innerText = storageStrings.serviceSection.downloadFilesPopup.modalHeader;
  currentSizeKey      .innerText = `${storageStrings.serviceSection.downloadFilesPopup.fileSizeProcessed} :`;
  currentSpeedKey     .innerText = `${storageStrings.serviceSection.downloadFilesPopup.downloadSpeed} :`;

  totalHeader         .innerText = storageStrings.serviceSection.downloadFilesPopup.totalHeader;
  totalSizeKey        .innerText = `${storageStrings.serviceSection.downloadFilesPopup.fileSizeProcessed} :`;
  totalSizeValue      .innerText = `0 / ${stringifiedTotalDataSize}`;
  totalBarStatus      .innerText = `0 %`;

  buttonCancel        .innerText = commonStrings.global.cancel;

  buttonCancel        .addEventListener('click', () =>
  {
    clearInterval(speedInterval);
    xhr.abort();
    document.getElementById('modalVeil').remove();
    document.getElementById('modalBackground').remove();
    document.getElementById('mainContainer').removeAttribute('style');
  });

  currentSize         .appendChild(currentSizeKey);
  currentSize         .appendChild(currentSizeValue);

  currentSpeed        .appendChild(currentSpeedKey);
  currentSpeed        .appendChild(currentSpeedValue);

  currentBar          .appendChild(currentBarStatus);
  currentBar          .appendChild(currentBarFiller);

  contentCurrent      .appendChild(currentHeader);
  contentCurrent      .appendChild(currentSize);
  contentCurrent      .appendChild(currentSpeed);
  contentCurrent      .appendChild(currentBar);

  totalSize           .appendChild(totalSizeKey);
  totalSize           .appendChild(totalSizeValue);

  totalBar            .appendChild(totalBarStatus);
  totalBar            .appendChild(totalBarFiller);

  contentTotal        .appendChild(totalHeader);
  contentTotal        .appendChild(totalSize);
  contentTotal        .appendChild(totalBar);

  contentButton       .appendChild(buttonCancel);

  modalContent        .appendChild(contentCurrent);
  modalContent        .appendChild(contentTotal);
  modalContent        .appendChild(contentButton);

  modal               .appendChild(modalHeader);
  modal               .appendChild(modalContent);

  document.getElementById('modalContainer').appendChild(modal);

  /************************************************************/

  var index = 0;
  var currentDataProcessed = [];

  var browseFiles = () =>
  {
    var previousDataState = 0;
    currentDataProcessed.push(0);

    const currentFileUuid = Object.keys(filesToDownload)[index];
    const currentFileData = filesToDownload[Object.keys(filesToDownload)[index]];

    const stringifiedCurrentFileSize = (currentFileData.fileSize / 1024 / 1024 / 1024) > 1
    ? `${(currentFileData.fileSize / 1024 / 1024 / 1024).toFixed(2)} Go`
    : (currentFileData.fileSize / 1024 / 1024) > 1
      ? `${(currentFileData.fileSize / 1024 / 1024).toFixed(2)} Mo`
      : (currentFileData.fileSize / 1024) > 1
        ? `${(currentFileData.fileSize / 1024).toFixed(2)} Ko`
        : `${currentFileData.fileSize} o`;

    currentHeader        .innerText = currentFileData.fileName;
    currentSizeValue     .innerText = `0 / ${stringifiedCurrentFileSize}`;
    currentSpeedValue    .innerText = `--/s`;
    currentBarStatus     .innerText = `0 %`;
    currentBarFiller      .style.width = `0%`;

    /************************************************************/

    xhr = new XMLHttpRequest();
    formData = new FormData();

    formData.append('fileUuid', currentFileUuid);
    formData.append('serviceUuid', serviceUuid);

    xhr.responseType = 'blob';

    xhr.open('PUT', '/queries/storage/services/download-file', true);

    /************************************************************/

    xhr.addEventListener('loadstart', (event) =>
    {
      speedInterval = setInterval(() =>
      {
        const dataUploadedFromLastLoop = currentDataProcessed[index] - previousDataState;

        currentSpeedValue.innerText = (dataUploadedFromLastLoop / 1024 / 1024 / 1024) > 1
        ? `${(dataUploadedFromLastLoop / 1024 / 1024 / 1024).toFixed(2)} Go/s`
        : (dataUploadedFromLastLoop / 1024 / 1024) > 1
          ? `${(dataUploadedFromLastLoop / 1024 / 1024).toFixed(2)} Mo/s`
          : (dataUploadedFromLastLoop / 1024) > 1
            ? `${(dataUploadedFromLastLoop / 1024).toFixed(2)} Ko/s`
            : `${dataUploadedFromLastLoop} o/s`;

        previousDataState = currentDataProcessed[index];

      }, 500);
    });

    /************************************************************/

    xhr.addEventListener('progress', (event) =>
    {
      currentDataProcessed[index] = event.loaded;

      const totalDataProcessed = currentDataProcessed.reduce((sum, currentValue) => sum + currentValue);

      const currentFileProgress = ((event.loaded / event.total) * 100).toFixed(2);
      const totalFilesProgress = ((totalDataProcessed / totalDataSize) * 100).toFixed(2);

      const currentFileProcessed = (event.loaded / 1024 / 1024 / 1024) > 1
      ? `${(event.loaded / 1024 / 1024 / 1024).toFixed(2)} Go`
      : (event.loaded / 1024 / 1024) > 1
        ? `${(event.loaded / 1024 / 1024).toFixed(2)} Mo`
        : (event.loaded / 1024) > 1
          ? `${(event.loaded / 1024).toFixed(2)} Ko`
          : `${event.loaded} o`;

      const totalDataProcessedStringified = (totalDataProcessed / 1024 / 1024 / 1024) > 1
      ? `${(totalDataProcessed / 1024 / 1024 / 1024).toFixed(2)} Go`
      : (totalDataProcessed / 1024 / 1024) > 1
        ? `${(totalDataProcessed / 1024 / 1024).toFixed(2)} Mo`
        : (totalDataProcessed / 1024) > 1
          ? `${(totalDataProcessed / 1024).toFixed(2)} Ko`
          : `${totalDataProcessed} o`;

      currentSizeValue    .innerText = `${currentFileProcessed} / ${stringifiedCurrentFileSize}`;
      totalSizeValue      .innerText = `${totalDataProcessedStringified} / ${stringifiedTotalDataSize}`;
      currentBarStatus    .innerText = `${currentFileProgress} %`;
      totalBarStatus      .innerText = `${totalFilesProgress} %`;

      currentBarFiller    .style.width = `${currentFileProgress}%`;
      totalBarFiller      .style.width = `${totalFilesProgress}%`;
    });

    /************************************************************/

    xhr.onload = () =>
    {
      clearInterval(speedInterval);

      if(xhr.status === 200)
      {
        currentSpeedValue.innerText = '--/s';

        const file    = xhr.response;
        const link    = document.createElement('a');
        link          .href = window.URL.createObjectURL(file);
        link          .download = filesToDownload[Object.keys(filesToDownload)[index]].fileName;
        link          .click();

        if(Object.keys(filesToDownload)[index += 1] != undefined) return browseFiles();

        document.getElementById('modalVeil').remove();
        document.getElementById('modalBackground').remove();

        return document.getElementById('mainContainer').removeAttribute('style');
      }

      var reader = new FileReader();

      reader.addEventListener('loadend', (event) =>
      {
        const text = event.srcElement.result;

        const json = JSON.parse(text);

        displayError(json.message, json.detail, null);

        document.getElementById('modalVeil').remove();
        document.getElementById('modalBackground').remove();
        document.getElementById('mainContainer').removeAttribute('style');
      });

      reader.readAsText(xhr.response);
    }

    /************************************************************/

    xhr.send(formData);
  }

  /************************************************************/

  browseFiles();
}

/****************************************************************************************************/
