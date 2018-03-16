/****************************************************************************************************/

$.ajax(
{
  type: 'GET', timeout: 2000, dataType: 'JSON', url: '/afk-time', success: () => {},
  error: (xhr, status, error) => {}
                      
}).done((result) =>
{
  var timeout = result.time;
  var counter = 0;

  document.onclick = () =>
  { 
    if(document.getElementById('afk-warning-veil')) document.getElementById('afk-warning-veil').remove();
    if(document.getElementById('afk-warning-popup')) document.getElementById('afk-warning-popup').remove();
    counter = 0; 
  }

  document.onkeypress = () =>
  { 
    if(document.getElementById('afk-warning-veil')) document.getElementById('afk-warning-veil').remove();
    if(document.getElementById('afk-warning-popup')) document.getElementById('afk-warning-popup').remove();
    counter = 0;
  }

  document.onmousemove = () =>
  { 
    if(document.getElementById('afk-warning-veil')) document.getElementById('afk-warning-veil').remove();
    if(document.getElementById('afk-warning-popup')) document.getElementById('afk-warning-popup').remove();
    counter = 0;
  }

  setInterval(() =>
  {
    checkTimeout(timeout, counter);
    counter += 1000;

  }, 1000);
});

/****************************************************************************************************/

function checkTimeout(timeout, counter)
{
  if((timeout - counter) <= (timeout * 0.1) && (timeout - counter) > 0)
  {
    if(document.getElementById('afk-warning-popup') == null)
    {
      openWarningPopup((timeout - counter) / 1000);
    }

    else
    {
      document.getElementById('afk-warning-info').innerText = `Temps restant avant déconnexion : ${(timeout - counter) / 1000} s`;
    }
  }

  else if((timeout - counter) <= 0)
  {
    $.ajax(
    {
      type: 'GET', timeout: 2000, url: '/logout', success: () => {},
      error: (xhr, status, error) => {}

    }).done(() => { location = '/'; });
  }
}

/****************************************************************************************************/

function openWarningPopup(remainingTime)
{
  var veil      = document.createElement('div');
  var info      = document.createElement('div');
  var popup     = document.createElement('div');
  var title     = document.createElement('div');
  var message   = document.createElement('div');

  veil          .setAttribute('id', 'afk-warning-veil');
  info          .setAttribute('id', 'afk-warning-info');
  title         .setAttribute('id', 'afk-warning-title');
  popup         .setAttribute('id', 'afk-warning-popup');
  message       .setAttribute('id', 'afk-warning-message');

  veil          .setAttribute('class', 'veil');
  popup         .setAttribute('class', 'popup');
  info          .setAttribute('class', 'popup-info');
  title         .setAttribute('class', 'popup-title');
  message       .setAttribute('class', 'popup-message');

  info          .innerText = `Temps restant avant déconnexion : ${remainingTime} s`;
  title         .innerText = 'ATTENTION';
  message       .innerText = 'Une inactivité prolongée entraine une déconnexion automatique !';

  popup         .appendChild(title);
  popup         .appendChild(message);
  popup         .appendChild(info);

  document.body .appendChild(veil);
  document.body .appendChild(popup);
}

/****************************************************************************************************/