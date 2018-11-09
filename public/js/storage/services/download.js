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
      if(currentFolderElements[x].children[0].checked) filesToDownload.push(currentFolderElements[x].getAttribute('name'));
    }
  }

  console.log(filesToDownload);
/*
  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('tag') && elements[x].children[2].checked) filesToDownload.push({ uuid: elements[x].getAttribute('id'), name: elements[x].innerText.slice(0, -1) });
  }

  if(filesToDownload.length > 0)
  {
    var background    = document.createElement('div');
    var spinner       = document.createElement('div');
    var box           = document.createElement('div');
    var title         = document.createElement('div');
    var content       = document.createElement('div');

    background        .setAttribute('id', 'downloadFileBackground');
    box               .setAttribute('id', 'downloadFileBox');
    content           .setAttribute('id', 'downloadFileContent');

    background        .setAttribute('class', 'storageBackground');
    spinner           .setAttribute('class', 'storageSpinner');
    box               .setAttribute('class', 'servicesDownloadFilePopup');
    title             .setAttribute('class', 'title');
    content           .setAttribute('class', 'content');

    spinner           .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

    box               .appendChild(title);
    box               .appendChild(content);
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

      const strings = json.strings;

      var counter                       = document.createElement('div');
      var currentProgressBlock          = document.createElement('div');
      var currentProgressBar            = document.createElement('div');
      var currentProgressLabel          = document.createElement('div');
      var currentProgressBarStatus      = document.createElement('div');
      var currentProgressBarCompleted   = document.createElement('div');
      var totalProgressBlock            = document.createElement('div');
      var totalProgressBar              = document.createElement('div');
      var totalProgressLabel            = document.createElement('div');
      var totalProgressBarStatus        = document.createElement('div');
      var totalProgressBarCompleted     = document.createElement('div');
      var cancel                        = document.createElement('button');

      counter                           .setAttribute('id', 'downloadFilesPopupCounter');
      currentProgressLabel              .setAttribute('id', 'downloadFilesPopupProgressLabel');
      totalProgressBarStatus            .setAttribute('id', 'downloadFilesPopupTotalProgressBar');
      currentProgressBarStatus          .setAttribute('id', 'downloadFilesPopupCurrentProgressBar');
      totalProgressBarCompleted         .setAttribute('id', 'downloadFilesPopupTotalProgressBarCompleted');
      currentProgressBarCompleted       .setAttribute('id', 'downloadFilesPopupCurrentProgressBarCompleted');

      counter                           .setAttribute('class', 'counter');
      currentProgressBlock              .setAttribute('class', 'progress');
      currentProgressLabel              .setAttribute('class', 'label');
      currentProgressBar                .setAttribute('class', 'bar');
      currentProgressBarStatus          .setAttribute('class', 'status');
      currentProgressBarCompleted       .setAttribute('class', 'completed');
      totalProgressBlock                .setAttribute('class', 'progress');
      totalProgressLabel                .setAttribute('class', 'label');
      totalProgressBar                  .setAttribute('class', 'bar');
      totalProgressBarStatus            .setAttribute('class', 'status');
      totalProgressBarCompleted         .setAttribute('class', 'completed');
      cancel                            .setAttribute('class', 'cancel');

      title                             .innerText = strings.services.popup.download.title;
      counter                           .innerText = `${strings.services.popup.download.counter} : 1/${filesToDownload.length}`;
      currentProgressLabel              .innerText = `${strings.services.popup.download.progress.current} :`;
      totalProgressLabel                .innerText = `${strings.services.popup.download.progress.total} :`;
      currentProgressBarStatus          .innerText = '0%';
      totalProgressBarStatus            .innerText = '0%';
      cancel                            .innerText = strings.services.popup.download.cancel;

      cancel.addEventListener('click', () => { xhr.abort(); closeDownloadPopup(); });

      currentProgressBar                .appendChild(currentProgressBarStatus);
      currentProgressBar                .appendChild(currentProgressBarCompleted);
      currentProgressBlock              .appendChild(currentProgressLabel);
      currentProgressBlock              .appendChild(currentProgressBar);

      totalProgressBar                  .appendChild(totalProgressBarStatus);
      totalProgressBar                  .appendChild(totalProgressBarCompleted);
      totalProgressBlock                .appendChild(totalProgressLabel);
      totalProgressBlock                .appendChild(totalProgressBar);

      content                           .appendChild(counter);
      content                           .appendChild(currentProgressBlock);
      content                           .appendChild(totalProgressBlock);
      content                           .appendChild(cancel);

      document.body                     .appendChild(box);

      browseFilesToDownload(filesToDownload, 0, strings);
    });
  }*/
}

/****************************************************************************************************/

function browseFilesToDownload(filesToDownload, index, strings)
{
  xhr   = new XMLHttpRequest();
  data  = new FormData();

  data.append('fileUuid', filesToDownload[index].uuid);
  data.append('serviceUuid', document.getElementById('mainBlock').getAttribute('name'));

  document.getElementById('downloadFilesPopupProgressLabel')  .innerText = `${filesToDownload[index].name} :`;
  document.getElementById('downloadFilesPopupCounter')        .innerText = `${strings.services.popup.download.counter} : ${index + 1}/${filesToDownload.length}`;

  xhr.responseType = 'blob';

  xhr.open('POST', '/queries/storage/services/download-file', true);

  xhr.send(data);

  xhr.onprogress = (event) =>
  {
    if(event.lengthComputable) 
    {
      var currentProgress             = ((event.loaded / event.total) * 100).toFixed(2);
      var totalProgress               = (((100 / filesToDownload.length) * index) + currentProgress / filesToDownload.length).toFixed(2);

      document.getElementById('downloadFilesPopupCurrentProgressBar')   .innerText = currentProgress + '%';
      document.getElementById('downloadFilesPopupTotalProgressBar')     .innerText = totalProgress + '%';

      document.getElementById('downloadFilesPopupCurrentProgressBarCompleted')  .style.width = `${parseInt(currentProgress)}%`;
      document.getElementById('downloadFilesPopupTotalProgressBarCompleted')    .style.width = `${parseInt(totalProgress)}%`;
    }

    else 
    {
      document.getElementById('downloadFilesPopupCurrentProgressBar')   .innerText = '?';
      document.getElementById('downloadFilesPopupTotalProgressBar')     .innerText = `?`;
    }
  }

  xhr.onload = () =>
  {
    if(xhr.status == 200)
    {
      socket.emit('storageAppServicesFileDownloaded', filesToDownload[index].uuid, document.getElementById('mainBlock').getAttribute('name'));

      var file    = xhr.response;
      var link    = document.createElement('a');
      link        .href = window.URL.createObjectURL(file);
      link        .download = filesToDownload[index].name;
      link        .click();

      if(filesToDownload[index += 1] != undefined) browseFilesToDownload(filesToDownload, index, strings);

      else
      {
        document.getElementById('downloadFileBox').remove();
        document.getElementById('downloadFileBackground').remove();

        displaySuccessMessage(strings.services.popup.download.done, null);
      }
    }

    else
    {
      if(xhr.status == 404)
      {
        socket.emit('storageAppServicesFileRemoved', filesToDownload[index].uuid, document.getElementById('mainBlock').getAttribute('name'));
      }

      reader = new FileReader();

      reader.addEventListener('loadend', (event) => 
      {
        const text = event.srcElement.result;

        const json = JSON.parse(text);

        displayDownloadPopupError(json.message, filesToDownload[index].name);
      });
      
      reader.readAsText(xhr.response);
    }
  }
}

/****************************************************************************************************/

function displayDownloadPopupError(message, detail)
{
  document.getElementById('downloadFileContent').style.display = 'none';

  var error     = document.createElement('div');
  var icon      = document.createElement('div');
  var content   = document.createElement('div');
  var button    = document.createElement('button');

  error         .setAttribute('class', 'error');
  icon          .setAttribute('class', 'icon');
  content       .setAttribute('class', 'content');
  button        .setAttribute('class', 'button');

  button        .addEventListener('click', closeDownloadPopup);

  icon          .innerHTML = `<i class='far fa-times-circle'></i>`;
  content       .innerText = message;
  button        .innerText = 'OK';

  error         .appendChild(icon);
  error         .appendChild(content);

  if(detail != null)
  {
    var detailBlock   = document.createElement('div');

    detailBlock       .setAttribute('class', 'detail');
    detailBlock       .innerText = detail;
    error             .appendChild(detailBlock);
  }

  error         .appendChild(button);

  document.getElementById('downloadFileBox').appendChild(error);
}

/****************************************************************************************************/

function closeDownloadPopup(event)
{
  document.getElementById('downloadFileBackground').remove();
  document.getElementById('downloadFileBox').remove();
}

/****************************************************************************************************/