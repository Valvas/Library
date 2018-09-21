/****************************************************************************************************/

if(document.getElementById('upload')) document.getElementById('upload').addEventListener('click', openUploadPopup);

/****************************************************************************************************/

function openUploadPopup(event)
{
  var background    = document.createElement('div');
  var box           = document.createElement('div');
  var spinner       = document.createElement('div');

  background        .setAttribute('id', 'uploadFileBackground');
  box               .setAttribute('id', 'uploadFileBox');

  background        .setAttribute('class', 'storageBackground');
  box               .setAttribute('class', 'servicesUploadFilePopup');
  spinner           .setAttribute('class', 'spinner');

  spinner           .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

  background        .style.display = 'block';

  box               .appendChild(spinner);
  document.body     .appendChild(background);
  document.body     .appendChild(box);

  $.ajax(
  {
    method: 'POST',
    dataType: 'json',
    data: { serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
    timeout: 5000,
    url: '/queries/storage/services/get-file-upload-parameters',

    error: (xhr, textStatus, errorThrown) =>
    {
      spinner.remove();

      xhr.responseJSON != undefined ?
      displayUploadPopupError(xhr.responseJSON.message, xhr.responseJSON.detail) :
      displayUploadPopupError('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    spinner.remove();

    var title           = document.createElement('div');
    var content         = document.createElement('div');
    var instructions    = document.createElement('div'); 
    var file            = document.createElement('div');
    var size            = document.createElement('div');
    var ext             = document.createElement('div');
    var label           = document.createElement('label');
    var input           = document.createElement('input');
    var send            = document.createElement('button');
    var close           = document.createElement('button');

    input               .setAttribute('type', 'file');
    input               .setAttribute('id', 'uploadFileInput');
    label               .setAttribute('id', 'uploadFileLabel');
    send                .setAttribute('id', 'uploadFileSend');
    size                .setAttribute('id', 'uploadFileSize');
    ext                 .setAttribute('id', 'uploadFileExt');
    content             .setAttribute('id', 'uploadFileContent');
    label               .setAttribute('for', 'uploadFileInput');
    size                .setAttribute('tag', parseInt(json.size));
    ext                 .setAttribute('tag', json.ext.join());

    title               .setAttribute('class', 'title');
    content             .setAttribute('class', 'content');
    instructions        .setAttribute('class', 'instructions');
    file                .setAttribute('class', 'file');
    label               .setAttribute('class', 'label');
    send                .setAttribute('class', 'send inactive');
    input               .setAttribute('class', 'input');
    size                .setAttribute('class', 'size');
    ext                 .setAttribute('class', 'ext');
    close               .setAttribute('class', 'close');

    close               .addEventListener('click', closeUploadFilePopup);
    input               .addEventListener('change', changeLabelValue);

    title               .innerText = json.strings.storage.services.popup.upload.title;
    instructions        .innerText = json.strings.storage.services.popup.upload.choice;
    label               .innerText = json.strings.storage.services.popup.upload.placeholder;
    send                .innerText = json.strings.storage.services.popup.upload.send;
    ext                 .innerText = json.strings.storage.services.popup.upload.ext + ' : ' + json.ext.join();
    close               .innerText = json.strings.storage.services.popup.upload.close;

    if(parseInt(json.size) < 1048576)
    {
      size              .innerText = json.strings.storage.services.popup.upload.size + ' : ' + parseInt(json.size / 1024) + 'Ko';
    }

    else if(parseInt(json.size) < 1073741824)
    {
      size              .innerText = json.strings.storage.services.popup.upload.size + ' : ' + parseInt(json.size / 1024 / 1024) + 'Mo';
    }

    else
    {
      size              .innerText = json.strings.storage.services.popup.upload.size + ' : ' + parseInt(json.size / 1024 / 1024 / 1024) + 'Go';
    }

    file                .appendChild(label);
    file                .appendChild(send);
    file                .appendChild(input);
    content             .appendChild(instructions);
    content             .appendChild(file);
    content             .appendChild(size);
    content             .appendChild(ext);
    content             .appendChild(close);
    box                 .appendChild(title);
    box                 .appendChild(content);
  });
}

/****************************************************************************************************/

function closeUploadFilePopup(event)
{
  if(document.getElementById('uploadFileBox')) document.getElementById('uploadFileBox').remove();
  if(document.getElementById('uploadFileBackground')) document.getElementById('uploadFileBackground').remove();
}

/****************************************************************************************************/

function closeUploadPopupError(event)
{
  if(document.getElementById('uploadFileBox')) document.getElementById('uploadFileBox').remove();
  if(document.getElementById('uploadFileBackground')) document.getElementById('uploadFileBackground').remove();
}

/****************************************************************************************************/

function changeLabelValue(event)
{
  document.getElementById('uploadFileSend').removeEventListener('click', checkBeforeUpload);
  document.getElementById('uploadFileSend').setAttribute('class', 'send inactive');
  document.getElementById('uploadFileLabel').innerText = event.target.files[0].name;
  document.getElementById('uploadFileSize').removeAttribute('style');
  document.getElementById('uploadFileExt').removeAttribute('style');
  document.getElementById('uploadFileLabel').removeAttribute('style');

  var check = true;
  
  if(event.target.files[0].size > parseInt(document.getElementById('uploadFileSize').getAttribute('tag')))
  {
    check = false;
    document.getElementById('uploadFileSize').style.color = '#D9534F';
    document.getElementById('uploadFileLabel').style.color = '#D9534F';
  }

  if(event.target.files[0].name.split('.').length < 2 || document.getElementById('uploadFileExt').getAttribute('tag').split(',').includes(event.target.files[0].name.split('.')[1]) == false)
  {
    check = false;
    document.getElementById('uploadFileExt').style.color = '#D9534F';
    document.getElementById('uploadFileLabel').style.color = '#D9534F';
  }

  if(check)
  {
    document.getElementById('uploadFileSend').setAttribute('class', 'send active');
    document.getElementById('uploadFileSend').addEventListener('click', checkBeforeUpload);
  }
}

/****************************************************************************************************/

function checkBeforeUpload(event)
{
  var background          = document.createElement('div');
  var spinner             = document.createElement('div');

  background              .setAttribute('class', 'loaderBackground');
  spinner                 .setAttribute('class', 'loaderSpinner');

  background              .setAttribute('id', 'uploadFileLoaderBackground');

  spinner                 .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

  document.getElementById('uploadFileBox').appendChild(background);
  document.getElementById('uploadFileBox').appendChild(spinner);

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  data.append('service', document.getElementById('mainBlock').getAttribute('name'));
  data.append('currentFolder', document.getElementById('filesBlock').getAttribute('name'));
  data.append('file', JSON.stringify({ 'name': document.getElementById('uploadFileInput').files[0].name, 'size': document.getElementById('uploadFileInput').files[0].size }));

  xhr.responseType = 'json';

  xhr.timeout = 10000;

  xhr.open('POST', '/queries/storage/services/prepare-upload', true);

  xhr.send(data);

  xhr.ontimeout = () =>
  {
    spinner.remove();
    background.remove();

    displayUploadPopupError('La requête a expiré, veuillez réessayer plus tard', null);
  }

  xhr.onload = () =>
  {
    spinner.remove();
    background.remove();

    document.getElementById('uploadFileContent').style.display = 'none';

    if(xhr.status == 500 || xhr.status == 406 || xhr.status == 404 || xhr.status == 403 || xhr.status == 401)
    {
      displayUploadPopupError(xhr.response.message, xhr.response.detail);
    }

    else
    {
      if(xhr.response.fileExists)
      {
        var warning       = document.createElement('div');
        var icon          = document.createElement('div');
        var content       = document.createElement('div');

        warning           .setAttribute('id', 'uploadFileWarning');

        warning           .setAttribute('class', 'warning');
        icon              .setAttribute('class', 'icon');
        content           .setAttribute('class', 'content');

        icon              .innerHTML = `<i class='fas fa-exclamation-triangle'></i>`;

        warning           .appendChild(icon);
        warning           .appendChild(content);
        
        if(xhr.response.rightToRemove == false)
        {
          content           .innerText = xhr.response.strings.storage.services.popup.upload.replace.unauthorized;

          var button      = document.createElement('button');

          button          .innerText = 'OK';
          button          .setAttribute('class', 'button');
          button          .addEventListener('click', closeUploadPopupError);

          warning         .appendChild(button);
        }

        else
        {
          content           .innerText = xhr.response.strings.storage.services.popup.upload.replace.authorized;

          var yes         = document.createElement('div');
          var no          = document.createElement('div');

          no              .innerHTML = `<i class='fas fa-times-circle'></i>`;
          yes             .innerHTML = `<i class='fas fa-check-circle'></i>`;

          no              .setAttribute('class', 'no');
          yes             .setAttribute('class', 'yes');
          no              .addEventListener('click', clickOnReplaceNo);
          yes             .addEventListener('click', clickOnReplaceYes);

          warning         .appendChild(yes);
          warning         .appendChild(no);
        }

        document.getElementById('uploadFileBox').appendChild(warning);
      }

      else
      {
        uploadFile();
      }
    }
  }
}

/****************************************************************************************************/

function uploadFile()
{
  document.getElementById('uploadFileContent').style.display = 'none';

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  xhr.responseType = 'json';

  data.append('service', document.getElementById('mainBlock').getAttribute('name'));
  data.append('currentFolder', document.getElementById('filesBlock').getAttribute('name'));
  data.append('file', document.getElementById('uploadFileInput').files[0]);

  var loader          = document.createElement('div');
  var sizeInfo        = document.createElement('div');
  var progressBar     = document.createElement('div');
  var loadedPart      = document.createElement('div');
  var statusMessage   = document.createElement('div');
  var cancelButton    = document.createElement('div');

  loader              .setAttribute('id', 'uploadFileProgressBar');
  
  loader              .setAttribute('class', 'loading');
  sizeInfo            .setAttribute('class', 'info');
  progressBar         .setAttribute('class', 'bar');
  loadedPart          .setAttribute('class', 'progress');
  statusMessage       .setAttribute('class', 'status');
  cancelButton        .setAttribute('class', 'cancel');

  statusMessage       .innerText = '0%';
  sizeInfo            .innerText = '.../...';

  loadedPart          .style.width = '0%';

  cancelButton        .innerHTML = `<i class='fas fa-times-circle'></i>`;

  progressBar         .appendChild(loadedPart);
  progressBar         .appendChild(statusMessage);
  loader              .appendChild(sizeInfo);
  loader              .appendChild(progressBar);
  loader              .appendChild(cancelButton);

  document.getElementById('uploadFileBox').appendChild(loader);

  cancelButton.addEventListener('click', (event) => 
  { 
    xhr               .abort();
    loader            .remove();

    document.getElementById('uploadFileContent').removeAttribute('style');
  });

  xhr.upload.addEventListener('progress', (event) => 
  {
    if(event.lengthComputable) 
    {
      var percentComplete = ((event.loaded / event.total) * 100).toFixed(2);

      if(parseInt(event.total) / 1024 / 1024 / 1024 / 1024 > 1) sizeInfo.innerHTML = `<div class='left'>${(event.loaded / 1024 / 1024 / 1024).toFixed(2)}</div><div class='right'>/ ${(event.total / 1024 / 1024 / 1024).toFixed(2)} Go</div>`;
      else if(parseInt(event.total) / 1024 / 1024 / 1024 > 1) sizeInfo.innerHTML = `<div class='left'>${(event.loaded / 1024 / 1024).toFixed(2)}</div><div class='right'>/ ${(event.total / 1024 / 1024).toFixed(2)} Mo</div>`;
      else if(parseInt(event.total) / 1024 / 1024 > 1) sizeInfo.innerHTML = `<div class='left'>${(event.loaded / 1024).toFixed(2)}</div><div class='right'>/ ${(event.total / 1024).toFixed(2)} Ko</div>`;
      else
      {
        sizeInfo.innerHTML = `<div class='left'>${event.loaded}</div><div class='right'>/ ${event.total} o</div>`;
      }
      
      statusMessage.innerText = `${percentComplete}%`;

      loadedPart.style.width = `${percentComplete}%`;
    }

    else 
    {
      statusMessage.innerText = '?';
    }
  }, false);

  xhr.open('POST', '/queries/storage/services/upload-file', true);

  xhr.send(data);

  xhr.ontimeout = () =>
  {
    loader.remove();

    displayUploadPopupError('La requête a expiré, veuillez réessayer plus tard', null);
  }

  xhr.onload = () =>
  {
    loader.remove();

    if(xhr.status == 200)
    {
      var success     = document.createElement('div');
      var message     = document.createElement('div');
      var icon        = document.createElement('div');
      var content     = document.createElement('div');
      var button      = document.createElement('button');

      success         .setAttribute('class', 'success');
      message         .setAttribute('class', 'message');
      icon            .setAttribute('class', 'icon');
      content         .setAttribute('class', 'content');
      button          .setAttribute('class', 'button');
      
      icon            .innerHTML = `<i class='far fa-check-circle'></i>`;
      content         .innerText = xhr.response.message;
      button          .innerText = 'OK';

      button          .addEventListener('click', closeUploadFilePopup);

      message         .appendChild(icon);
      message         .appendChild(content);
      success         .appendChild(message);
      success         .appendChild(button);

      document.getElementById('uploadFileBox').appendChild(success);

      socket.emit('storageAppServicesfileUploaded', xhr.response.fileUuid, document.getElementById('mainBlock').getAttribute('name'), document.getElementById('currentPath').children[document.getElementById('currentPath').children.length - 1].getAttribute('name'));
    }

    else
    {
      displayUploadPopupError(xhr.response.message, xhr.response.detail);
    }
  }
}

/****************************************************************************************************/

function clickOnReplaceYes(event)
{
  document.getElementById('uploadFileWarning').remove();

  uploadFile();
}

/****************************************************************************************************/

function clickOnReplaceNo(event)
{
  document.getElementById('uploadFileWarning').remove();
  document.getElementById('uploadFileContent').removeAttribute('style');
}

/****************************************************************************************************/

function displayUploadPopupError(message, detail)
{
  if(document.getElementById('uploadFileContent')) document.getElementById('uploadFileContent').style.display = 'none';

  var error     = document.createElement('div');
  var icon      = document.createElement('div');
  var content   = document.createElement('div');
  var button    = document.createElement('button');

  error         .setAttribute('class', 'error');
  icon          .setAttribute('class', 'icon');
  content       .setAttribute('class', 'content');
  button        .setAttribute('class', 'button');

  button        .addEventListener('click', closeUploadPopupError);

  icon          .innerHTML = `<i class='far fa-times-circle'></i>`;
  content       .innerText = message;
  button        .innerText = 'OK';

  error         .appendChild(icon);
  error         .appendChild(content);
  error         .appendChild(button);

  if(detail != null)
  {
    var detailBlock   = document.createElement('div');

    detailBlock       .setAttribute('class', 'detail');
    detailBlock       .innerText = detail;
    error             .appendChild(detailBlock);
  }

  document.getElementById('uploadFileBox').appendChild(error);
}

/****************************************************************************************************/