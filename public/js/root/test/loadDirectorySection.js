/****************************************************************************************************/

function loadDirectorySection()
{
  displayLocationLoader();

  var directoryContainer  = document.createElement('div');

  directoryContainer      .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.directory}</div>`;

  directoryContainer      .setAttribute('class', 'directorySectionBlock');

  directoryContainer      .style.display = 'none';

  document.getElementById('locationContent').appendChild(directoryContainer);

  if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

  $(directoryContainer).fadeIn(250);
}

/****************************************************************************************************/
