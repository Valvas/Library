/****************************************************************************************************/

var currentXhrRequest = null;

/****************************************************************************************************/

function downloadSelection(event)
{
  if(document.getElementById('currentFolder') == null) return;

  const currentFolderElements = document.getElementById('currentFolder').children;

  var filesToDownload = [];

  for(var x = 0; x < currentFolderElements.length; x++)
  {
    if(currentFolderElements[x].children[0].tagName === 'INPUT')
    {
      if(currentFolderElements[x].children[0].checked) filesToDownload.push({ uuid: currentFolderElements[x].getAttribute('name'), name: currentFolderElements[x].children[2].innerText });
    }
  }

  if(filesToDownload.length === 0) return;

  createBackground('downloadFilesBackground');

  displayLoader('', (loader) =>
  {
    getStorageAppStrings((error, strings) =>
    {
      removeLoader(loader, () => {  });

      if(error != null)
      {
        removeBackground('downloadFilesBackground');

        displayError(error.message, error.detail, null);

        return;
      }

      var box             = document.createElement('div');
      var content         = document.createElement('div');
      var currentProgress = document.createElement('div');
      var totalProgress   = document.createElement('div');

      box                 .setAttribute('id', 'downloadFileBox');

      box                 .setAttribute('class', 'standardPopup');
      content             .setAttribute('class', 'downloadFilePopupContent');
      currentProgress     .setAttribute('class', 'downloadFilePopupProgress');
      totalProgress       .setAttribute('class', 'downloadFilePopupProgress');

      box                 .innerHTML += `<div class="downloadFilePopupTitle">${strings.services.popup.download.title}</div>`;
      content             .innerHTML += `<div id="filesToDownloadCounter" class="downloadFilePopupCounter">${strings.services.popup.download.counter} : 1/${filesToDownload.length}</div>`;
      currentProgress     .innerHTML += `<div class="downloadFilePopupProgressTitle">${strings.services.popup.download.progress.current}</div>`;
      currentProgress     .innerHTML += `<div class="downloadFilePopupProgressBar"><div id="currentProgressLabel" class="downloadFilePopupProgressBarLabel">0 %</div><div id="currentProgressStatus" class="downloadFilePopupProgressBarStatus"></div></div>`;
      totalProgress       .innerHTML += `<div class="downloadFilePopupProgressTitle">${strings.services.popup.download.progress.total}</div>`;
      totalProgress       .innerHTML += `<div class="downloadFilePopupProgressBar"><div id="totalProgressLabel" class="downloadFilePopupProgressBarLabel">0 %</div><div id="totalProgressStatus" class="downloadFilePopupProgressBarStatus"></div></div>`;

      content             .appendChild(currentProgress);
      content             .appendChild(totalProgress);

      content             .innerHTML += `<button class="downloadFilePopupCancel">${strings.services.popup.download.cancel}</button>`;

      box                 .appendChild(content);

      document.body       .appendChild(box);

      browseFilesToDownload(filesToDownload, 0, strings);
    });
  });
}

/****************************************************************************************************/

function browseFilesToDownload(filesToDownload, index, strings)
{
  currentXhrRequest = new XMLHttpRequest();
  data = new FormData();

  data.append('fileUuid', filesToDownload[index].uuid);
  data.append('serviceUuid', document.getElementById('serviceUuid').getAttribute('name'));

  document.getElementById('filesToDownloadCounter').innerText = `${strings.services.popup.download.counter} : ${index + 1}/${filesToDownload.length}`;

  currentXhrRequest.responseType = 'blob';

  currentXhrRequest.open('PUT', '/queries/storage/services/download-file', true);

  currentXhrRequest.send(data);

  currentXhrRequest.onprogress = (event) =>
  {
    if(event.lengthComputable) 
    {
      var currentProgress             = ((event.loaded / event.total) * 100).toFixed(2);
      var totalProgress               = (((100 / filesToDownload.length) * index) + currentProgress / filesToDownload.length).toFixed(2);

      document.getElementById('currentProgressLabel')   .innerText = currentProgress + ' %';
      document.getElementById('totalProgressLabel')     .innerText = totalProgress + ' %';

      document.getElementById('currentProgressStatus')  .style.width = `${parseInt(currentProgress)}%`;
      document.getElementById('totalProgressStatus')    .style.width = `${parseInt(totalProgress)}%`;
    }

    else 
    {
      document.getElementById('currentProgressLabel')   .innerText = '? %';
      document.getElementById('totalProgressLabel')     .innerText = `? %`;
    }
  }

  currentXhrRequest.onload = () =>
  {
    if(currentXhrRequest.status === 200)
    {
      var file    = currentXhrRequest.response;
      var link    = document.createElement('a');
      link        .href = window.URL.createObjectURL(file);
      link        .download = filesToDownload[index].name;
      link        .click();

      if(filesToDownload[index += 1] != undefined) return browseFilesToDownload(filesToDownload, index, strings);

      closeDownloadPopup();

      return;
    }

    reader = new FileReader();

    reader.addEventListener('loadend', (event) => 
    {
      const text = event.srcElement.result;

      const json = JSON.parse(text);

      displayError(json.message, filesToDownload[index].name, null);
    });
    
    reader.readAsText(currentXhrRequest.response);

    if(filesToDownload[index += 1] != undefined) return browseFilesToDownload(filesToDownload, index, strings);

    closeDownloadPopup();
  }
}

/****************************************************************************************************/

function closeDownloadPopup()
{
  if(currentXhrRequest != null) currentXhrRequest.abort();

  currentXhrRequest = null;

  removeBackground('downloadFilesBackground');

  if(document.getElementById('downloadFileBox')) document.getElementById('downloadFileBox').remove();
}

/****************************************************************************************************/