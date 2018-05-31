var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  if(document.getElementById('accessDetailAccountInfo')) socket.emit('adminAppAccessDetailJoin', document.getElementById('accessDetailAccountInfo').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('updateAccess', (error, access, strings) =>
{
  $.ajax(
  {
    type: 'GET', timeout: 2000, dataType: 'JSON', url: '/queries/admin/rights/get-session-rights', success: () => {},
    error: (xhr, status, error) =>
    {

    }
                    
  }).done((json) => 
  {
    for(var app in access)
    {
      if(access[app] == 0)
      {
        document.getElementById(app).children[0].setAttribute('class', 'accessDetailBlockAppNameDisabled');

        if(json.rights.add_access == 1)
        {
          document.getElementById(app).children[1].setAttribute('class', 'accessDetailBlockAppSwitchActive');
          document.getElementById(app).children[1].setAttribute('onclick', 'addAccess("' + app + '")');
          document.getElementById(app).children[1].setAttribute('title', strings.appsAccess.giveAccess.authorized);

          document.getElementById(app).children[1].children[0].setAttribute('class', 'accessDetailBlockAppSwitchBackgroundDisabled');

          document.getElementById(app).children[1].children[0].children[0].setAttribute('class', 'accessDetailBlockAppSwitchCircleDisabled');
        }

        else
        {
          document.getElementById(app).children[1].setAttribute('class', 'accessDetailBlockAppSwitchInactive');
          document.getElementById(app).children[1].removeAttribute('onclick');
          document.getElementById(app).children[1].setAttribute('title', strings.appsAccess.giveAccess.unauthorized);

          document.getElementById(app).children[1].children[0].setAttribute('class', 'accessDetailBlockAppSwitchBackgroundInactive');

          document.getElementById(app).children[1].children[0].children[0].setAttribute('class', 'accessDetailBlockAppSwitchCircleDisabledInactive');
        }
      }

      else
      {
        document.getElementById(app).children[0].setAttribute('class', 'accessDetailBlockAppNameEnabled');

        if(json.rights.remove_access == 1)
        {
          document.getElementById(app).children[1].setAttribute('class', 'accessDetailBlockAppSwitchActive');
          document.getElementById(app).children[1].setAttribute('onclick', 'removeAccess("' + app + '")');
          document.getElementById(app).children[1].setAttribute('title', strings.appsAccess.removeAccess.authorized);

          document.getElementById(app).children[1].children[0].setAttribute('class', 'accessDetailBlockAppSwitchBackgroundEnabled');

          document.getElementById(app).children[1].children[0].children[0].setAttribute('class', 'accessDetailBlockAppSwitchCircleEnabled');
        }

        else
        {
          document.getElementById(app).children[1].setAttribute('class', 'accessDetailBlockAppSwitchInactive');
          document.getElementById(app).children[1].removeAttribute('onclick');
          document.getElementById(app).children[1].setAttribute('title', strings.appsAccess.removeAccess.unauthorized);

          document.getElementById(app).children[1].children[0].setAttribute('class', 'accessDetailBlockAppSwitchBackgroundInactive');

          document.getElementById(app).children[1].children[0].children[0].setAttribute('class', 'accessDetailBlockAppSwitchCircleEnabledInactive');
        }
      }
    }
  });
});