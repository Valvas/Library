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
    case 'home':      loadHomeSection();      break;

    default:          loadHomeSection();      break;
  }
}

/****************************************************************************************************/

function displayLocationLoader()
{
  document.getElementById('locationContainer').innerHTML = '<div id="locationLoaderVerticalBlock"><div id="locationLoaderHorizontalBlock"><div id="locationLoaderSpinner"></div></div></div>';
}

/****************************************************************************************************/
