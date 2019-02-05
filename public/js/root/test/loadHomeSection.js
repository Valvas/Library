/****************************************************************************************************/

function loadHomeSection()
{
  displayLocationLoader();

  var homeContainer       = document.createElement('div');

  homeContainer           .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.home}</div>`;

  homeContainer           .setAttribute('class', 'homeSectionBlock');

  homeContainer           .style.display = 'none';

  document.getElementById('locationContent').appendChild(homeContainer);

  if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

  $(homeContainer).fadeIn(250);
}

/****************************************************************************************************/
