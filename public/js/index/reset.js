/****************************************************************************************************/

document.getElementById('form').addEventListener('submit', sendDataForm);

/****************************************************************************************************/

function sendDataForm(event)
{
  event.preventDefault();

  document.getElementById('error').removeAttribute('style');
  document.getElementById('success').removeAttribute('style');
  document.getElementById('main').style.filter = 'blur(3px)';
  document.getElementById('background').style.display = 'block';

  if(document.getElementById('email').value.length > 0)
  {
    if(new RegExp("^[a-zA-Z][\\w\\.-]*[a-zA-Z0-9]@[a-zA-Z0-9][\\w\\.-]*[a-zA-Z0-9]\\.[a-zA-Z][a-zA-Z\\.]*[a-zA-Z]$").test(document.getElementById('email').value) == false)
    {
      document.getElementById('background').removeAttribute('style');
      document.getElementById('main').removeAttribute('style');
      document.getElementById('error').innerText = `Le format de l'adresse email est incorrect`;
      document.getElementById('error').style.display = 'block';
    }

    else
    {
      $.ajax(
      {
        type: 'PUT', timeout: 120000, dataType: 'JSON', data: { 'email': document.getElementById('email').value }, url: '/reset-password', success: () => {},
        error: (xhr, status, error) => 
        {
          document.getElementById('background').removeAttribute('style');
          document.getElementById('main').removeAttribute('style');

          xhr.responseJSON != undefined
          ? document.getElementById('error').innerText = xhr.responseJSON.message
          : document.getElementById('error').innerText = 'Une erreur est survenue, veuillez réessayer plus tard';

          document.getElementById('error').style.display = 'block';
        } 
  
      }).done((json) =>
      {
        document.getElementById('background').removeAttribute('style');
        document.getElementById('main').removeAttribute('style');
        document.getElementById('form').reset();
        document.getElementById('success').innerText = json.message;
        document.getElementById('success').style.display = 'block';
      });
    }
  }
}

/****************************************************************************************************/