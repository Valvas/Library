/****************************************************************************************************/

function createLoader(loaderMessage = null)
{
  if(document.getElementById('commonLoaderVeil')) return;
  if(document.getElementById('commonLoaderWrapper')) return;

  const loaderVeil      = document.createElement('div');
  const loaderWrapper   = document.createElement('div');
  const loaderContainer = document.createElement('div');
  const loaderBlock     = document.createElement('div');

  loaderVeil      .setAttribute('id', 'commonLoaderVeil');
  loaderWrapper   .setAttribute('id', 'commonLoaderWrapper');
  loaderContainer .setAttribute('id', 'commonLoaderContainer');
  loaderBlock     .setAttribute('id', 'commonLoaderBlock');

  loaderBlock     .innerHTML += `<div id="commonLoaderSpinner"></div>`;
  loaderBlock     .innerHTML += loaderMessage === null
  ? `<div id="commonLoaderMessage">${commonStrings.global.loading}</div>`
  : `<div id="commonLoaderMessage">${loaderMessage}</div>`;

  loaderWrapper   .appendChild(loaderContainer);
  loaderContainer .appendChild(loaderBlock);

  document.body   .appendChild(loaderVeil);
  document.body   .appendChild(loaderWrapper);
}

/****************************************************************************************************/

function closeLoader()
{
  if(document.getElementById('commonLoaderVeil'))
  {
    document.getElementById('commonLoaderVeil').remove();
  }

  if(document.getElementById('commonLoaderWrapper'))
  {
    document.getElementById('commonLoaderWrapper').remove();
  }
}

/****************************************************************************************************/
