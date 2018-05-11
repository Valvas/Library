/****************************************************************************************************/

function openAdminPrompt(content, params)
{
  if(document.getElementById('blur'))
  {
    document.getElementById('blur').style.filter = 'blur(4px)';
  }

  var background      = document.createElement('div');
  var prompt          = document.createElement('div');
  var title           = document.createElement('div');

  background          .setAttribute('class', 'adminAppBackground');
  prompt              .setAttribute('class', 'adminAppPrompt');
  title               .setAttribute('class', 'adminAppPromptTitle');

  background          .setAttribute('id', 'adminAppBackground');
  prompt              .setAttribute('id', 'adminAppPrompt');
  title               .setAttribute('id', 'adminAppPromptTitle');

  title               .innerText = '...';

  prompt              .appendChild(title);

  $(prompt)           .hide().appendTo(document.body);

  $(background)       .hide().appendTo(document.body);

  displayPromptLoading();

  $(background).slideDown(250, () =>
  {
    $(prompt).fadeIn(250, () =>
    {
      $.ajax(
      {
        type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/admin/strings', success: () => {},
        error: (xhr, status, error) =>
        {
          if(xhr.responseJSON == undefined)
          {
            displayPromptError('La requête a expiré, veuillez réessayer plus tard', null);
          }

          else
          {
            displayPromptError(xhr.responseJSON.message, xhr.responseJSON.detail);
          }
        }
                        
      }).done((json) => 
      {
        document.getElementById('adminAppPromptLoading').remove();

        switch(content)
        {
          case 'exit':            loadExitContent(json.strings, params);            break;
          case 'addRight':        loadAddRightContent(json.strings, params);        break;
          case 'addAccess':       loadAddAccessContent(json.strings, params);       break;
          case 'removeRight':     loadRemoveRightContent(json.strings, params);     break;
          case 'removeAccess':    loadRemoveAccessContent(json.strings, params);    break;
        }
      });
    });
  });
}

/****************************************************************************************************/

function displayPromptLoading()
{
  if(document.getElementById('adminAppPromptContent')) document.getElementById('adminAppPromptContent').remove();

  var loading         = document.createElement('div');

  loading             .setAttribute('id', 'adminAppPromptLoading');
  loading             .setAttribute('class', 'adminAppPromptLoading');
  loading             .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  document.getElementById('adminAppPrompt').appendChild(loading);
}

/****************************************************************************************************/

function loadExitContent(strings, params)
{
  var content     = document.createElement('div');
  var message     = document.createElement('div');
  var confirm     = document.createElement('button');
  var cancel      = document.createElement('button');

  content         .setAttribute('id', 'adminAppPromptContent');

  message         .setAttribute('class', 'adminAppPromptMessage');
  confirm         .setAttribute('class', 'adminAppPromptConfirm');
  cancel          .setAttribute('class', 'adminAppPromptCancel');

  document.getElementById('adminAppPromptTitle').innerText = strings.prompts.exit.title;

  message         .innerText = strings.prompts.exit.message;
  confirm         .innerText = strings.prompts.exit.confirm;
  cancel          .innerText = strings.prompts.exit.cancel;

  confirm         .addEventListener('click', exitApp);
  cancel          .addEventListener('click', closeAdminPrompt);

  content         .appendChild(message);
  content         .appendChild(confirm);
  content         .appendChild(cancel);

  document.getElementById('adminAppPrompt').appendChild(content);
}

/****************************************************************************************************/

function loadRemoveRightContent(strings, params)
{
  var content     = document.createElement('div');
  var message     = document.createElement('div');
  var confirm     = document.createElement('button');
  var cancel      = document.createElement('button');

  content         .setAttribute('id', 'adminAppPromptContent');

  message         .setAttribute('class', 'adminAppPromptMessage');
  confirm         .setAttribute('class', 'adminAppPromptConfirm');
  cancel          .setAttribute('class', 'adminAppPromptCancel');

  document.getElementById('adminAppPromptTitle').innerText = strings.rights.detail.administrationRights[`${params.rightToRemove.split('_')[0]}${params.rightToRemove.split('_')[1].charAt(0).toUpperCase()}${params.rightToRemove.split('_')[1].slice(1)}`];

  message         .innerText = strings.prompts.removeRight.message;
  confirm         .innerText = strings.prompts.removeRight.confirm;
  cancel          .innerText = strings.prompts.removeRight.cancel;

  confirm         .addEventListener('click', () => { sendRightToRemove(params.rightToRemove, strings); });
  cancel          .addEventListener('click', closeAdminPrompt);

  content         .appendChild(message);
  content         .appendChild(confirm);
  content         .appendChild(cancel);

  document.getElementById('adminAppPrompt').appendChild(content);
}

/****************************************************************************************************/

function loadAddRightContent(strings, params)
{
  var content     = document.createElement('div');
  var message     = document.createElement('div');
  var confirm     = document.createElement('button');
  var cancel      = document.createElement('button');

  content         .setAttribute('id', 'adminAppPromptContent');

  message         .setAttribute('class', 'adminAppPromptMessage');
  confirm         .setAttribute('class', 'adminAppPromptConfirm');
  cancel          .setAttribute('class', 'adminAppPromptCancel');

  document.getElementById('adminAppPromptTitle').innerText = strings.rights.detail.administrationRights[`${params.rightToAdd.split('_')[0]}${params.rightToAdd.split('_')[1].charAt(0).toUpperCase()}${params.rightToAdd.split('_')[1].slice(1)}`];

  message         .innerText = strings.prompts.addRight.message;
  confirm         .innerText = strings.prompts.addRight.confirm;
  cancel          .innerText = strings.prompts.addRight.cancel;

  confirm         .addEventListener('click', () => { sendRightToAdd(params.rightToAdd, strings); });
  cancel          .addEventListener('click', closeAdminPrompt);

  content         .appendChild(message);
  content         .appendChild(confirm);
  content         .appendChild(cancel);

  document.getElementById('adminAppPrompt').appendChild(content);
}

/****************************************************************************************************/

function loadAddAccessContent(strings, params)
{
  var content     = document.createElement('div');
  var message     = document.createElement('div');
  var confirm     = document.createElement('button');
  var cancel      = document.createElement('button');

  content         .setAttribute('id', 'adminAppPromptContent');

  message         .setAttribute('class', 'adminAppPromptMessage');
  confirm         .setAttribute('class', 'adminAppPromptConfirm');
  cancel          .setAttribute('class', 'adminAppPromptCancel');

  document.getElementById('adminAppPromptTitle').innerText = strings.appsAccess.apps[params.appName];

  message         .innerText = strings.prompts.addAccess.message;
  confirm         .innerText = strings.prompts.addAccess.confirm;
  cancel          .innerText = strings.prompts.addAccess.cancel;

  confirm         .addEventListener('click', () => { sendAppToGiveAccess(params.appName, strings); });
  cancel          .addEventListener('click', closeAdminPrompt);

  content         .appendChild(message);
  content         .appendChild(confirm);
  content         .appendChild(cancel);

  document.getElementById('adminAppPrompt').appendChild(content);
}

/****************************************************************************************************/

function loadRemoveAccessContent(strings, params)
{
  var content     = document.createElement('div');
  var message     = document.createElement('div');
  var confirm     = document.createElement('button');
  var cancel      = document.createElement('button');

  content         .setAttribute('id', 'adminAppPromptContent');

  message         .setAttribute('class', 'adminAppPromptMessage');
  confirm         .setAttribute('class', 'adminAppPromptConfirm');
  cancel          .setAttribute('class', 'adminAppPromptCancel');

  document.getElementById('adminAppPromptTitle').innerText = strings.appsAccess.apps[params.appName];

  message         .innerText = strings.prompts.removeAccess.message;
  confirm         .innerText = strings.prompts.removeAccess.confirm;
  cancel          .innerText = strings.prompts.removeAccess.cancel;

  confirm         .addEventListener('click', () => { sendAppToRemoveAccess(params.appName, strings); });
  cancel          .addEventListener('click', closeAdminPrompt);

  content         .appendChild(message);
  content         .appendChild(confirm);
  content         .appendChild(cancel);

  document.getElementById('adminAppPrompt').appendChild(content);
}

/****************************************************************************************************/