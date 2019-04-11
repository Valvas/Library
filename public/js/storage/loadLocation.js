/****************************************************************************************************/

function loadLocation(sectionToLoad)
{
  currentLocation = sectionToLoad;

  const navigationBarMenuElements = document.getElementById('navigationBarMenu').children;

  for(var x = 0; x < navigationBarMenuElements.length; x++)
  {
    navigationBarMenuElements[x].setAttribute('class', 'navigationBarContentMenuElement');

    if(navigationBarMenuElements[x].getAttribute('name') === currentLocation) navigationBarMenuElements[x].setAttribute('class', 'navigationBarContentMenuElementSelected');
  }

  switch(sectionToLoad)
  {
    case 'home':    loadHomeSection();            break;
    case 'service': loadServiceStorageSection();  break;
    case 'admin':   window.location = '/storage/admin'; break;
    //case 'admin':   loadAdminSection();           break;
    default:        loadHomeSection();            break;
  }
}

/****************************************************************************************************/

function displayLocationLoader()
{
  document.getElementById('contentContainer').innerHTML = '<div id="locationLoaderContainer"><div id="locationLoaderWrapper"><div id="locationLoaderSpinner"></div></div></div>';
}

/****************************************************************************************************/
