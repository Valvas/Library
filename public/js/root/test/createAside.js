/****************************************************************************************************/

function createAside(callback)
{
  var aside                 = document.createElement('div');
  var asideMenu             = document.createElement('ul');

  aside             .setAttribute('class', 'asideBlock');
  asideMenu         .setAttribute('class', 'asideMenu');

  asideMenu         .innerHTML += `<li class="">Menu</li>`;
  asideMenu         .innerHTML += `<li class="">Menu</li>`;
  asideMenu         .innerHTML += `<li class="">Menu</li>`;
  asideMenu         .innerHTML += `<li class="">Menu</li>`;
  asideMenu         .innerHTML += `<li class="">Menu</li>`;

  aside             .appendChild(asideMenu);

  document.getElementById('contentContainer').appendChild(aside);

  return callback(null);
}

/****************************************************************************************************/
