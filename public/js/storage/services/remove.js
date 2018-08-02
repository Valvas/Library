/****************************************************************************************************/

if(document.getElementById('removeFilesButton')) document.getElementById('removeFilesButton').addEventListener('click', removeSelection);

/****************************************************************************************************/

function removeSelection(event)
{
  if(document.getElementById('removePromptBackground') == null)
  {
    var elements = document.getElementById('filesBlock').children;

    var filesToRemove = [];

    for(var x = 0; x < elements.length; x++)
    {
      if(elements[x].hasAttribute('tag'))
      {
        if(elements[x].children[2] && elements[x].children[2].checked) filesToRemove.push({ uuid: elements[x].getAttribute('name'), name: elements[x].children[1].innerText });
      }
    }

    if(filesToRemove.length > 0) openConfirmationPrompt(filesToRemove);
  }
}

/****************************************************************************************************/

function openConfirmationPrompt(filesToRemove)
{
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
  });
}

/****************************************************************************************************/

function closeConfirmationPrompt(event)
{
  if(document.getElementById('removePromptBackground')) document.getElementById('removePromptBackground').remove();
  if(document.getElementById('removePrompt')) document.getElementById('removePrompt').remove();
}

/****************************************************************************************************/

function confirmSuppression(filesToRemove, strings)
{
  if(document.getElementById('removePromptContent')) document.getElementById('removePromptContent').remove();
  if(document.getElementById('removePromptConfirm')) document.getElementById('removePromptConfirm').remove();
  if(document.getElementById('removePromptCancel')) document.getElementById('removePromptCancel').remove();

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

  var filesUuid = [];

  for(var x = 0; x < filesToRemove.length; x++)
  {
    filesUuid.push(filesToRemove[x].uuid);
  }

  $.ajax(
  {
    method: 'DELETE',
    dataType: 'json',
    timeout: 5000,
    data: { filesToRemove: JSON.stringify(filesUuid), serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
    url: '/queries/storage/services/remove-files',

    error: (xhr, textStatus, errorThrown) =>
    {
      if(document.getElementById('removePrompt')) document.getElementById('removePrompt').remove();
      if(document.getElementById('removePromptBackground')) document.getElementById('removePromptBackground').remove();

      xhr.responseJSON != undefined ?
      displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail) :
      displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }
  }).done((json) =>
  {
    if(document.getElementById('removePrompt')) document.getElementById('removePrompt').remove();
    if(document.getElementById('removePromptBackground')) document.getElementById('removePromptBackground').remove();

    displaySuccessMessage(strings.services.popup.remove.done, null);

    for(var x = 0; x < filesUuid.length; x++) socket.emit('storageAppServicesFileRemoved', filesUuid[x], document.getElementById('mainBlock').getAttribute('name'));
  });
}