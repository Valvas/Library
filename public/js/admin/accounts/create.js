/****************************************************************************************************/

if(document.getElementById('create-account-form')) document.getElementById('create-account-form').addEventListener('submit', checkForm);

/****************************************************************************************************/

function checkForm(event)
{
  event.preventDefault();

  document.getElementById('create-account-form-email-error')      .removeAttribute('style');
  document.getElementById('create-account-form-lastname-error')   .removeAttribute('style');
  document.getElementById('create-account-form-firstname-error')  .removeAttribute('style');

  const email       = document.getElementById('create-account-form-email').value;
  const lastname    = document.getElementById('create-account-form-lastname').value.toLowerCase();
  const firstname   = document.getElementById('create-account-form-firstname').value.toLowerCase();

  var data          = new FormData();
  var xhr           = new XMLHttpRequest();

  data              .append('email', email);
  data              .append('lastname', lastname);
  data              .append('firstname', firstname);

  xhr               .open('POST', '/queries/admin/accounts/create', true);

  xhr               .responseType = 'json';

  xhr               .send(data);

  xhr.onreadystatechange = () => 
  {
    if(xhr.readyState == xhr.DONE)
    {
      if(xhr.status == 404 || xhr.status == 406 || xhr.status == 500)
      {
        if(xhr.response.target == null)
        {
          printGlobalErrorMessage(xhr.response.message);
        }

        else
        {
          printInputErrorMessage(xhr.response.message, xhr.response.target);
        }
      }

      else
      {
        socket.emit('accountCreated', email);
        printSuccessMessage(xhr.response.message);
      }
    }
  }
}

/****************************************************************************************************/

function printGlobalErrorMessage(message)
{
  document.getElementById('create-account-form').style.filter = 'blur(4px)';

  var block         = document.createElement('div');
  var error         = document.createElement('div');
  var button        = document.createElement('button');

  block             .setAttribute('class', 'block');
  error             .setAttribute('class', 'error');
  button            .setAttribute('class', 'ok');

  block             .setAttribute('id', 'create-account-form-block');

  error             .innerText = message;
  button            .innerText = 'OK';

  button            .addEventListener('click', closeGlobalMessage);

  block             .appendChild(error);
  block             .appendChild(button);

  document.getElementById('create-account-block').appendChild(block);

  button            .focus();
}

/****************************************************************************************************/

function printInputErrorMessage(message, target)
{
  if(document.getElementById(`create-account-form-${target}-error`))
  {
    document.getElementById(`create-account-form-${target}-error`).innerText = message;
    document.getElementById(`create-account-form-${target}-error`).style.display = 'block';
  }
}

/****************************************************************************************************/

function printSuccessMessage(message)
{
  document.getElementById('create-account-form').style.filter = 'blur(4px)';

  var block         = document.createElement('div');
  var success       = document.createElement('div');
  var button        = document.createElement('button');

  block             .setAttribute('class', 'block');
  success           .setAttribute('class', 'success');
  button            .setAttribute('class', 'ok');

  block             .setAttribute('id', 'create-account-form-block');

  success           .innerText = message;
  button            .innerText = 'OK';

  button            .addEventListener('click', closeGlobalMessage);

  block             .appendChild(success);
  block             .appendChild(button);

  document.getElementById('create-account-block').appendChild(block);

  button            .focus();

  document.getElementById('create-account-form').reset();
}

/****************************************************************************************************/

function closeGlobalMessage(event)
{
  if(document.getElementById('create-account-form-block')) document.getElementById('create-account-form-block').remove();

  document.getElementById('create-account-form').removeAttribute('style');
}

/****************************************************************************************************/