/****************************************************************************************************/

if(document.getElementById('resetForm'))
{
  document.getElementById('resetForm').addEventListener('submit', resetPasswordSubmit);
}

if(document.getElementById('emailInput'))
{
  document.getElementById('emailInput').addEventListener('focus', () =>
  {
    if(document.getElementById('emailError') === null) return;

    document.getElementById('emailError').removeAttribute('style');
  });
}

/****************************************************************************************************/

function resetPasswordSubmit(event)
{
  event.preventDefault();

  if(document.getElementById('formError') === null) return;
  if(document.getElementById('formSuccess') === null) return;

  document.getElementById('formError').removeAttribute('style');
  document.getElementById('formSuccess').removeAttribute('style');
  document.getElementById('emailError').removeAttribute('style');
  document.getElementById('formError').innerText = '';
  document.getElementById('formSuccess').innerText = '';

  const email = event.target.elements['email'].value.trim();

  if(email.length === 0)
  {
    return document.getElementById('emailError').style.display = 'block';
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

  document.body   .appendChild(loaderVeil);
  document.body   .appendChild(loaderWrapper);

  /**************************************************/

  $.ajax(
  {
    method: 'PUT', timeout: 120000, dataType: 'JSON', data: { 'email': email }, url: '/reset-password', success: () => {},

    error: (xhr, status, error) =>
    {
      loaderVeil.remove();
      loaderWrapper.remove();

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
    loaderVeil.remove();
    loaderWrapper.remove();

    event.target.reset();

    document.getElementById('formSuccess').innerText = result.message;
    document.getElementById('formSuccess').style.display = 'block';
  });
}

/****************************************************************************************************/
