/****************************************************************************************************/

if(document.getElementById('initLogonForm')) document.getElementById('initLogonForm').addEventListener('submit', sendData);

/****************************************************************************************************/

function sendData(event)
{
  event.preventDefault();

  if(document.getElementById('password') == null) return;

  document.getElementById('errorMessage').innerText = '';

  if(document.getElementById('password').value.length === 0) return document.getElementById('errorMessage').innerText = 'Veuillez entrer un mot de passe';

  $.ajax(
  {
    type: 'PUT', timeout: 5000, dataType: 'JSON', data: { password: document.getElementById('password').value }, url: '/init/logon', success: () => {},
    error: (xhr, status, error) => { document.getElementById('errorMessage').innerText = xhr.responseJSON.message; }
                  
  }).done((json) =>
  {
    document.cookie = 'peiinit=' + json.token + '; max-age=' + json.maxAge;

    location = '/init/form';
  });
}

/****************************************************************************************************/