/****************************************************************************************************/

$(window).click(() => { closeMenu(); });
  
$('#navigation-menu-list').click((event) => { event.stopPropagation(); });
$('#navigation-menu-icon').click((event) => { event.stopPropagation(); });

if(document.getElementById('navigation-apps-icon'))
{
  document.getElementById('navigation-apps-icon').addEventListener('click', openMenuAppsList);
}

if(document.getElementById('navigation-menu-icon'))
{
  document.getElementById('navigation-menu-icon').addEventListener('click', openMenu);
}

/****************************************************************************************************/

function openMenu(event)
{
  closeAccountMenu();

  document.getElementById('navigation-menu-icon').removeEventListener('click', openMenu);

  $(document.getElementById('navigation-menu-list')).slideDown(250, () =>
  {
    document.getElementById('navigation-menu-icon').style.color = '#7EDA7E';

    document.getElementById('navigation-menu-icon').addEventListener('click', closeMenu);
  });
}

/****************************************************************************************************/

function closeMenu(event)
{
  document.getElementById('navigation-menu-icon').removeEventListener('click', closeMenu);

  if(document.getElementById('navigation-apps-icon'))
  {
    closeMenuAppsList();
  }

  $(document.getElementById('navigation-menu-list')).slideUp(250, () =>
  {
    document.getElementById('navigation-menu-icon').removeAttribute('style');

    document.getElementById('navigation-menu-icon').addEventListener('click', openMenu);
  });
}

/****************************************************************************************************/

function openMenuAppsList()
{
  document.getElementById('navigation-apps-icon').removeEventListener('click', openMenuAppsList);

  $(document.getElementById('navigation-apps-list')).slideDown(100, () =>
  {
    document.getElementById('navigation-apps-icon').style.color = '#428BCA';
    document.getElementById('navigation-apps-icon').children[1].innerHTML = `<i class='fas fa-angle-up'></i>`;

    document.getElementById('navigation-apps-icon').addEventListener('click', closeMenuAppsList);
  });
}

/****************************************************************************************************/

function closeMenuAppsList()
{
  document.getElementById('navigation-apps-icon').removeEventListener('click', closeMenuAppsList);

  $(document.getElementById('navigation-apps-list')).slideUp(100, () =>
  {
    document.getElementById('navigation-apps-icon').removeAttribute('style');
    document.getElementById('navigation-apps-icon').children[1].innerHTML = `<i class='fas fa-angle-down'></i>`;

    document.getElementById('navigation-apps-icon').addEventListener('click', openMenuAppsList);
  });
}

/****************************************************************************************************/