/****************************************************************************************************/

function createAside(callback)
{
  const asideMenu = document.createElement('ul');

  asideMenu.setAttribute('class', 'asideMenu');

  asideMenu.setAttribute('id', 'asideMenu');

  /**************************************************/

  for(let location in appStrings.asideMenu)
  {
    if(location === 'admin' && accountData.isAdmin === false) continue;

    const asideMenuElement  = document.createElement('li');

    if(currentLocation === location)
    {
      asideMenuElement    .setAttribute('class', 'selected');
    }

    asideMenuElement      .setAttribute('name', location);

    asideMenuElement      .innerText = appStrings.asideMenu[location];

    asideMenuElement      .addEventListener('click', () =>
    {
      urlParameters = [];
      loadLocation(location);
    });

    asideMenu             .appendChild(asideMenuElement);
  }

  /**************************************************/

  document.getElementById('asideContainer').appendChild(asideMenu);

  return callback(null);
}

/****************************************************************************************************/
