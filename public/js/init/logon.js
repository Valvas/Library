document.getElementById('send').addEventListener('click', sendData);

function sendData(event)
{
  if(document.getElementById('password').value.length == 0) document.getElementById('fail').innerText = 'Veuillez entrer un mot de passe';

  else
  {
    $.ajax(
    {
      type: 'POST', timeout: 2000, dataType: 'JSON', data: { password: document.getElementById('password').value }, url: '/init/logon', success: () => {},
      error: (xhr, status, error) => { document.getElementById('fail').innerText = xhr.responseJSON.message; }
                    
    }).done((json) =>
    { 
      location = '/init/form';
    });
  }
}