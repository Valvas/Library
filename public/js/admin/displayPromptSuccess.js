/****************************************************************************************************/

function displayPromptSuccess(message)
{
  if(document.getElementById('adminAppPromptLoading')) document.getElementById('adminAppPromptLoading').remove();
  
  var successBlock    = document.createElement('div');
  var successMessage  = document.createElement('div');
  var successClose    = document.createElement('button');

  successBlock        .setAttribute('class', 'adminAppPromptSuccessBlock');
  successMessage      .setAttribute('class', 'adminAppPromptSuccessMessage');
  successClose        .setAttribute('class', 'adminAppPromptSuccessClose');

  successMessage      .innerText = message;
  successClose        .innerText = 'OK';

  successClose        .addEventListener('click', closeAdminPrompt);

  successBlock        .appendChild(successMessage);
  successBlock        .appendChild(successClose);

  document.getElementById('adminAppPrompt').appendChild(successBlock);
}

/****************************************************************************************************/