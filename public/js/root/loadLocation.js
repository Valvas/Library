/****************************************************************************************************/

function loadLocation(sectionToLoad)
{
  currentLocation = sectionToLoad;

  const asideMenuElements = document.getElementById('asideMenu').children;

  for(var x = 0; x < asideMenuElements.length; x++)
  {
    asideMenuElements[x].setAttribute('class', 'asideMenuElement');

    if(asideMenuElements[x].getAttribute('name') === currentLocation) asideMenuElements[x].setAttribute('class', 'asideMenuElementSelected');
  }

  switch(sectionToLoad)
  {
    case 'home':      loadHomeSection();      break;
    case 'account':   loadAccountSection();   break;
    case 'news':      loadArticlesSection();  break;
    case 'apps':      loadAppsSection();      break;
    case 'directory': loadDirectorySection(); break;

    case 'admin':     window.location = '/administration'; break;

    //Put a default with an error showing on the dom
  }
}

/****************************************************************************************************/

function displayLocationLoader()
{
  document.getElementById('locationContent').innerHTML = '<div id="locationLoaderVerticalBlock"><div id="locationLoaderHorizontalBlock"><div id="locationLoaderSpinner"></div></div></div>';

  document.getElementById('locationLoaderVerticalBlock').style.height = `${document.getElementById('asideBlock').offsetHeight}px`;
}

/****************************************************************************************************/
