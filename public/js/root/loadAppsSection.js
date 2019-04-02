/****************************************************************************************************/

function loadAppsSection()
{
  displayLocationLoader();

  history.pushState(null, null, '/apps');

  $.ajax(
  {
    type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/root/apps/get-account-apps', success: () => {},
    error: (xhr, status, error) =>
    {
      if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

      xhr.responseJSON != undefined ?
      displayError(xhr.responseJSON.message, xhr.responseJSON.detail, 'loadAppsSectionError') :
      displayError('Une erreur est survenue, veuillez réessayer plus tard', null, 'loadAppsSectionError');
    }

  }).done((result) =>
  {
    var appsContainer       = document.createElement('div');
    var appsContainerList   = document.createElement('div');

    appsContainer           .innerHTML += `<div class="locationContentTitle">${commonStrings.locations.apps}</div>`;

    appsContainer           .setAttribute('class', 'appsSectionBlock');
    appsContainerList       .setAttribute('class', 'appsSectionList');

    for(var x = 0; x < result.accountApps.length; x++)
    {
      if(result.accountApps[x].name === 'sick') continue;
      
      var currentApp        = document.createElement('div');
      var currentAppAside   = document.createElement('div');
      var currentAppData    = document.createElement('div');
      var currentAppAccess  = document.createElement('div');

      currentApp            .setAttribute('class', 'appsSectionListElement');
      currentAppAside       .setAttribute('class', 'appsSectionListElementAside');
      currentAppData        .setAttribute('class', 'appsSectionListElementData');
      currentAppAccess      .setAttribute('class', 'appsSectionListElementAccess');

      currentApp            .innerHTML += `<div class="appsSectionListElementPicture"><img src="data:image/png;base64,${result.accountApps[x].picture}" /></div>`;
      currentAppData        .innerHTML += `<div class="appsSectionListElementDataTitle">${commonStrings.apps[result.accountApps[x].name]}</div>`;
      currentAppData        .innerHTML += `<div class="appsSectionListElementDataDescription">${commonStrings.root.apps.descriptions[result.accountApps[x].name]}</div>`;

      currentAppAccess      .innerHTML += result.accountApps[x].hasAccess
      ? `<a href="${result.accountApps[x].name}" class="appsSectionListElementAccessTrue">${commonStrings.root.apps.accessApp}</a>`
      : `<div class="appsSectionListElementAccessFalse">${commonStrings.root.apps.noAccess}</div>`;

      currentAppAside       .appendChild(currentAppData);
      currentAppAside       .appendChild(currentAppAccess);
      currentApp            .appendChild(currentAppAside);
      appsContainerList     .appendChild(currentApp);
    }

    appsContainer           .appendChild(appsContainerList);

    appsContainer           .style.display = 'none';

    document.getElementById('locationContent').appendChild(appsContainer);

    if(document.getElementById('locationLoaderVerticalBlock')) document.getElementById('locationLoaderVerticalBlock').remove();

    $(appsContainer).fadeIn(250);
  });
}

/****************************************************************************************************/
