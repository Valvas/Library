/****************************************************************************************************/

function displayPromptError(message, detail)
{
  if(document.getElementById('adminAppPromptLoading')) document.getElementById('adminAppPromptLoading').remove();
  
  var errorBlock      = document.createElement('div');
  var errorMessage    = document.createElement('div');
  var errorClose      = document.createElement('button');

  errorBlock          .setAttribute('class', 'adminAppPromptErrorBlock');
  errorMessage        .setAttribute('class', 'adminAppPromptErrorMessage');
  errorClose          .setAttribute('class', 'adminAppPromptErrorClose');

  errorMessage        .innerText = message;
  errorClose          .innerText = 'OK';

  errorClose          .addEventListener('click', closeAdminPrompt);

  errorBlock          .appendChild(errorMessage);
  errorBlock          .appendChild(errorClose);

  if(detail != null)
  {
    var errorDetail   = document.createElement('div');

    errorDetail       .setAttribute('class', 'adminAppPromptErrorDetail');

    errorDetail       .innerText = detail;

    errorBlock        .appendChild(errorDetail);
  }

  document.getElementById('adminAppPrompt').appendChild(errorBlock);
}

/****************************************************************************************************/