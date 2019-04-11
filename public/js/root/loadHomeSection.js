/****************************************************************************************************/

function loadHomeSection()
{
  displayLocationLoader();

  history.pushState(null, null, '/home');

  const homeContainer     = document.createElement('div');

  homeContainer           .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.home}</div>`;
  homeContainer           .innerHTML += `<div class="homePagePictureContainer"><img class="homePagePictureContent" src="/pictures/home.png" /></div>`;

  homeContainer           .setAttribute('class', 'homeSectionBlock');

  homeContainer           .style.display = 'none';

  document.getElementById('locationContent').appendChild(homeContainer);

  $(document.getElementById('locationLoaderVerticalBlock')).fadeOut(250, () =>
  {
    document.getElementById('locationLoaderVerticalBlock').remove();

    $(homeContainer).fadeIn(250);
  });
}

/****************************************************************************************************/
