/****************************************************************************************************/

document.getElementById('form').addEventListener('submit', sendFormData);

/****************************************************************************************************/

function sendFormData(event)
{
  event.preventDefault();

  document.getElementById('error').innerText = '';
  document.getElementById('main').style.filter = 'blur(3px)';
  document.getElementById('background').style.display = 'block';

  if(document.getElementById('email').value.length > 0 && document.getElementById('password').value.length > 0)
  {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    $.ajax(
    {
      type: 'PUT', timeout: 5000, dataType: 'JSON', data: { 'emailAddress': email, 'uncryptedPassword': password }, url: '/', success: () => {},
      error: (xhr, status, error) => 
      {
        document.getElementById('background').removeAttribute('style');
        document.getElementById('main').removeAttribute('style');

        if(status == 'timeout') document.getElementById('error').innerText = 'Le serveur a mis trop de temps à répondre...';
        else{ document.getElementById('error').innerText = JSON.parse(xhr.responseText).message; }
      } 

    }).done((json) =>
    {
      location = '/home';
    });
  }
}

/****************************************************************************************************/