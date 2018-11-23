/****************************************************************************************************/

if(document.getElementById('appSearch')) document.getElementById('appSearch').addEventListener('input', searchForApps);

/****************************************************************************************************/

function searchForApps(event)
{
  const apps = document.getElementsByName('appBlock');

  var appsToDisplay = [];

  for(var x = 0; x < apps.length; x++)
  {
    var isToBeDisplayed = false;

    if(apps[x].children[0].innerText.toLowerCase().includes(event.target.value.toLowerCase())) isToBeDisplayed = true;

    isToBeDisplayed
    ? appsToDisplay.push(apps[x])
    : apps[x].style.display = 'none';
  }

  for(var x = 0; x < appsToDisplay.length; x++)
  {
    (x % 2) === 0
    ? appsToDisplay[x].setAttribute('class', 'accessDetailRightsBlockListAppOdd')
    : appsToDisplay[x].setAttribute('class', 'accessDetailRightsBlockListAppEven');

    appsToDisplay[x].removeAttribute('style');
  }
}

/****************************************************************************************************/