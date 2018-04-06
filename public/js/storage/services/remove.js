/****************************************************************************************************/

if(document.getElementById('remove')) document.getElementById('remove').addEventListener('click', removeSelection);

/****************************************************************************************************/

function removeSelection(event)
{
  var files = document.getElementById('filesBlock').children;

  var x = 0;
  var filesToRemove = [];

  var browseFileLoop = () =>
  {
    if(files[x].children[0].children[0].checked) filesToRemove.push(files[x].getAttribute('name'));
    if(files[x += 1] != undefined) browseFileLoop();
  }

  if(files[x] != undefined) browseFileLoop();

  if(filesToRemove.length > 0)
  {
    openConfirmationPrompt(filesToRemove);
  }
}

/****************************************************************************************************/

function openConfirmationPrompt(filesToRemove)
{
  document.getElementById('blur').style.filter = 'blur(4px)';

  var background      = document.createElement('div');
  var prompt          = document.createElement('div');
  var title           = document.createElement('div');
  var content         = document.createElement('div');
  var message         = document.createElement('div');
  var loading         = document.createElement('div');
  var confirm         = document.createElement('div');
  var cancel          = document.createElement('div');

  background          .setAttribute('id', 'removePromptBackground');
  prompt              .setAttribute('id', 'removePrompt');
  content             .setAttribute('id', 'removePromptContent');

  background          .setAttribute('class', 'background');
  prompt              .setAttribute('class', 'removeFilesPrompt');
  title               .setAttribute('class', 'title');
  loading             .setAttribute('class', 'loading');
  content             .setAttribute('class', 'content');
  message             .setAttribute('class', 'message');
  confirm             .setAttribute('class', 'confirm');
  cancel              .setAttribute('class', 'cancel');

  title               .innerText = '...';
  loading             .innerHTML = `<div class='spinner'><i class='fas fa-circle-notch fa-spin'></i></div>`;
  confirm             .innerHTML = `<i class='fas fa-check-circle'></i>`;
  cancel              .innerHTML = `<i class='fas fa-times-circle'></i>`;

  background          .style.display = 'block';

  prompt              .appendChild(title);
  prompt              .appendChild(loading);
  background          .appendChild(prompt);
  document.body       .appendChild(background);

  var xhr = new XMLHttpRequest();

  xhr.responseType = 'json';
  xhr.timeout = 10000;

  xhr.open('GET', '/queries/storage/strings', true);

  xhr.send(null);

  xhr.ontimeout = () =>
  {
    loading.remove();

    displayRemovePromptError('La requête a expiré, veuillez réessayer plus tard', null);
  }

  xhr.onload = () =>
  {
    loading.remove();

    if(xhr.status == 200)
    {
      title           .innerText = xhr.response.strings.services.popup.remove.title;
      message         .innerText = xhr.response.strings.services.popup.remove.message;

      confirm         .addEventListener('click', () => { confirmSuppression(filesToRemove, xhr.response.strings); });
      cancel          .addEventListener('click', closeConfirmationPrompt);

      content         .appendChild(message);

      var x = 0;

      var listFiles = () =>
      {
        var file      = document.createElement('div');
        file          .innerText = '- ' + filesToRemove[x];
        file          .setAttribute('class', 'file');
        content       .appendChild(file);

        if(filesToRemove[x += 1] != undefined) listFiles();
      }

      listFiles();

      content         .appendChild(confirm);
      content         .appendChild(cancel);

      prompt          .appendChild(content);
    }

    else
    {
      displayRemovePromptError(xhr.response.message, xhr.response.detail);
    }
  }
}

/****************************************************************************************************/

function displayRemovePromptError(errorMessage, errorDetail)
{
  if(document.getElementById('removePromptContent')) document.getElementById('removePromptContent').style.display = 'none';

  var error           = document.createElement('div');
  var message         = document.createElement('div');
  var icon            = document.createElement('div');
  var content         = document.createElement('div');
  var close           = document.createElement('button');

  error               .setAttribute('class', 'error');
  message             .setAttribute('class', 'message');
  icon                .setAttribute('class', 'icon');
  content             .setAttribute('class', 'content');
  close               .setAttribute('class', 'close');

  icon                .innerHTML = `<i class='far fa-times-circle'></i>`;
  content             .innerText = errorMessage;
  close               .innerText = 'OK';

  close               .addEventListener('click', closeConfirmationPrompt);

  message             .appendChild(icon);
  message             .appendChild(content);
  error               .appendChild(message);
  error               .appendChild(close);

  if(errorDetail != null)
  {
    var detail        = document.createElement('div');

    detail            .setAttribute('class', 'detail');
    detail            .innerText = errorDetail;

    error             .appendChild(detail);
  }

  document.getElementById('removePrompt').appendChild(error);
}

/****************************************************************************************************/

function closeConfirmationPrompt(event)
{
  document.getElementById('removePromptBackground').remove();
  document.getElementById('blur').removeAttribute('style');
}

/****************************************************************************************************/

function confirmSuppression(filesToRemove, strings)
{
  document.getElementById('removePromptContent').remove();

  var loading         = document.createElement('div');
  var spinner         = document.createElement('div');
  var message         = document.createElement('div');

  loading             .setAttribute('class', 'loading');
  spinner             .setAttribute('class', 'spinner');
  message             .setAttribute('class', 'message');

  spinner             .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;
  message             .innerText = strings.services.popup.remove.pending;

  loading             .appendChild(spinner);
  loading             .appendChild(message);

  document.getElementById('removePrompt').appendChild(loading);

  var xhr   = new XMLHttpRequest();
  var data  = new FormData();

  data.append('service', document.getElementById('main').getAttribute('name'));
  data.append('files', filesToRemove.join());

  xhr.timeout = 10000;
  xhr.responseType = 'json';

  xhr.open('POST', '/queries/storage/services/remove-files', true);

  xhr.send(data);

  xhr.ontimeout = () =>
  {
    loading.remove();

    displayRemovePromptError('La requête a expiré, veuillez réessayer plus tard', null);
  }

  xhr.onload = () =>
  {
    loading.remove();

    if(xhr.status == 200)
    {
      var success     = document.createElement('div');
      var message     = document.createElement('div');
      var icon        = document.createElement('div');
      var content     = document.createElement('div');
      var close       = document.createElement('button');

      success         .setAttribute('class', 'success');
      message         .setAttribute('class', 'message');
      icon            .setAttribute('class', 'icon');
      content         .setAttribute('class', 'content');
      close           .setAttribute('class', 'close');

      icon            .innerHTML = `<i class='far fa-check-circle'></i>`;
      content         .innerText = strings.services.popup.remove.done;
      close           .innerText = 'OK';

      close           .addEventListener('click', closeConfirmationPrompt);

      message         .appendChild(icon);
      message         .appendChild(content);
      success         .appendChild(message);
      success         .appendChild(close);

      document.getElementById('removePrompt').appendChild(success);

      var x = 0;

      var emitRemoveSignalLoop = () =>
      {
        socket.emit('storageAppServicesFileRemoved', filesToRemove[x], document.getElementById('main').getAttribute('name'));

        if(filesToRemove[x += 1] != undefined) emitRemoveSignalLoop();
      }

      if(filesToRemove[x] != undefined) emitRemoveSignalLoop();
    }

    else
    {
      displayRemovePromptError(xhr.response.message, xhr.response.detail);
    }
  }
}