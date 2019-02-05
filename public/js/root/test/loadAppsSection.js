/****************************************************************************************************/

function loadAppsSection()
{
  displayLocationLoader();

  var appsContainer       = document.createElement('div');

  appsContainer           .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.apps}</div>`;

  appsContainer           .setAttribute('class', 'appsSectionBlock');

  appsContainer           .style.display = 'none';

  document.getElementById('locationContent').appendChild(appsContainer);

  if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

  $(appsContainer).fadeIn(250);
}

/****************************************************************************************************/
