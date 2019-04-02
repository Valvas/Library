/****************************************************************************************************/

function loadHomeSection()
{
  displayLocationLoader();

  history.pushState(null, null, '/sick/home');

  document.getElementById('locationContainer').innerHTML = `<div class="locationContentTitle">${appStrings.home.locationLabel}</div>`;
}

/****************************************************************************************************/
