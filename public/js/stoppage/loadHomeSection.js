/****************************************************************************************************/

function loadHomeSection()
{
  displayLocationLoader();

  history.pushState(null, null, '/stoppage/home');

  $(document.getElementById('locationWrapper')).fadeOut(250, () =>
  {
    document.getElementById('locationLoaderVerticalBlock').remove();

    document.getElementById('locationContainer').innerHTML = `<div class="locationContentTitle">${appStrings.home.locationLabel}</div>`;

    $(document.getElementById('locationWrapper')).fadeIn(250);
  });
}

/****************************************************************************************************/
