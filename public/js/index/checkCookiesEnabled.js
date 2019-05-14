/****************************************************************************************************/

if(navigator.cookieEnabled === false)
{
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
    method: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/strings/get-common', success: () => {},

    error: (xhr, status, error) =>
    {
      loaderVeil.remove();
      loaderWrapper.remove();

      xhr.responseJSON !== undefined
      ? displayCookieWarningPopup(xhr.responseJSON.message)
      : displayCookieWarningPopup('Échec de communication avec le serveur. Celui-ci est peut-être indisponible ou alors votre connexion rencontre des difficultés. Veuillez réessayer plus tard.');
    }

  }).done((result) =>
  {
    loaderVeil.remove();
    loaderWrapper.remove();

    displayCookieWarningPopup(null, result.strings);
  });
}

/****************************************************************************************************/

function displayCookieWarningPopup(error, strings)
{
  const cookieWarningVeil       = document.createElement('div');
  const cookieWarningWrapper    = document.createElement('div');
  const cookieWarningContainer  = document.createElement('div');
  const cookieWarningBlock      = document.createElement('div');

  cookieWarningVeil         .setAttribute('class', 'cookieWarningVeil');
  cookieWarningWrapper      .setAttribute('class', 'cookieWarningWrapper');
  cookieWarningContainer    .setAttribute('class', 'cookieWarningContainer');
  cookieWarningBlock        .setAttribute('class', 'cookieWarningBlock');

  cookieWarningBlock        .innerHTML += error === null
  ? `<div class="cookieWarningBlockMessage">${strings.cookieWarningMessage}</div>`
  : `<div class="cookieWarningBlockError">${error}</div>`;

  cookieWarningContainer    .appendChild(cookieWarningBlock);
  cookieWarningWrapper      .appendChild(cookieWarningContainer);

  document.body             .appendChild(cookieWarningVeil);
  document.body             .appendChild(cookieWarningWrapper);
}

/****************************************************************************************************/
