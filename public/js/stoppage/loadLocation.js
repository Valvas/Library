/****************************************************************************************************/

function loadLocation(sectionToLoad)
{
  currentLocation = sectionToLoad;

  const asideMenuElements = document.getElementById('asideMenu').children;

  for(var x = 0; x < asideMenuElements.length; x++)
  {
    asideMenuElements[x].removeAttribute('class');

    if(asideMenuElements[x].getAttribute('name') === currentLocation)
    {
      asideMenuElements[x].setAttribute('class', 'selected');
    }
  }

  switch(sectionToLoad)
  {
    case 'home':      loadHomeSection();          break;
    case 'list':      loadStoppageSection();      break;
    case 'add':       loadStoppageSection();      break;

    default:          loadHomeSection();          break;
  }
}

/****************************************************************************************************/

function displayLocationLoader()
{
  document.getElementById('locationContainer').innerHTML = '<div id="locationLoaderVerticalBlock"><div id="locationLoaderHorizontalBlock"><div id="locationLoaderSpinner"></div></div></div>';
}

/****************************************************************************************************/

function displayLocationError(errorMessage = commonStrings.global.xhrErrors.timeout, errorDetail = null)
{
  if(document.getElementById('locationContainer') === null) return;

  document.getElementById('locationContainer').innerHTML = '';

  const errorBlock = document.createElement('div');

  errorBlock.setAttribute('class', 'locationErrorBlock');

  errorBlock.innerHTML += `<div class="locationErrorBlockTitle">${commonStrings.global.error}</div>`;
  errorBlock.innerHTML += `<div class="locationErrorBlockMessage">${errorMessage}</div>`;

  if(errorDetail !== null)
  {
    errorBlock.innerHTML += `<div class="locationErrorBlockDetail">${errorDetail}</div>`;
  }

  document.getElementById('locationContainer').appendChild(errorBlock);
}

/****************************************************************************************************/
