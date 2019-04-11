/****************************************************************************************************/

if(document.getElementById('logonForm'))
{
  document.getElementById('logonForm').addEventListener('submit', logonFormSubmit);
}

if(document.getElementById('emailInput'))
{
  document.getElementById('emailInput').addEventListener('focus', () =>
  {
    if(document.getElementById('emailError') === null) return;

    document.getElementById('emailError').removeAttribute('style');
  });
}

if(document.getElementById('passwordInput'))
{
  document.getElementById('passwordInput').addEventListener('focus', () =>
  {
    if(document.getElementById('passwordError') === null) return;

    document.getElementById('passwordError').removeAttribute('style');
  });
}

/****************************************************************************************************/

function logonFormSubmit(event)
{
  event.preventDefault();

  if(document.getElementById('formError') === null) return;

  document.getElementById('formError').removeAttribute('style');
  document.getElementById('emailError').removeAttribute('style');
  document.getElementById('passwordError').removeAttribute('style');
  document.getElementById('formError').innerText = '';

  const username = event.target.elements['email'].value.trim();
  const password = event.target.elements['password'].value.trim();

  if(username.length === 0)
  {
    return document.getElementById('emailError').style.display = 'block';
  }

  if(password.length === 0)
  {
    return document.getElementById('passwordError').style.display = 'block';
  }

  /**************************************************/

  const loaderVeil      = document.createElement('div');
  const loaderWrapper   = document.createElement('div');
  const loaderContainer = document.createElement('div');
  const loaderBlock     = document.createElement('div');

  loaderVeil      .setAttribute('class', 'loaderVeil');
  loaderWrapper   .setAttribute('class', 'loaderWrapper');
  loaderContainer .setAttribute('class', 'loaderContainer');
  loaderBlock     .setAttribute('class', 'loaderBlock');

  loaderBlock     .innerHTML += `<div class="loaderBlockSpinner"></div>`;

  loaderWrapper   .appendChild(loaderContainer);
  loaderContainer .appendChild(loaderBlock);

  document.getElementById('main').style.filter = 'blur(4px)';

  document.body   .appendChild(loaderVeil);
  document.body   .appendChild(loaderWrapper);

  /**************************************************/

  $.ajax(
  {
    method: 'PUT', timeout: 10000, dataType: 'JSON', data: { 'emailAddress': username, 'uncryptedPassword': password }, url: '/', success: () => {},

    error: (xhr, status, error) =>
    {
      loaderVeil.remove();
      loaderWrapper.remove();
      document.getElementById('main').removeAttribute('style');

      if(xhr.responseJSON !== undefined)
      {
        document.getElementById('formError').innerText = xhr.responseJSON.message;
        document.getElementById('formError').style.display = 'block';
      }

      else
      {
        document.getElementById('formError').innerText = 'Échec de communication avec le serveur. Celui-ci est peut-être indisponible ou alors votre connexion rencontre des difficultés. Veuillez réessayer plus tard';
        document.getElementById('formError').style.display = 'block';
      }
    }

  }).done((result) =>
  {
    document.cookie = `peiauth=${result.token};max-age=${result.maxAge};path=/`;

    window.location = '/home';
  });
}

/****************************************************************************************************/
