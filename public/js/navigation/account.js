/****************************************************************************************************/

$(window).click(() => { closeAccountMenu(); });
  
$('#navigation-account-icon').click((event) => { event.stopPropagation(); });
$('#navigation-account-list').click((event) => { event.stopPropagation(); });

document.getElementById('navigation-account-icon').addEventListener('click', openAccountMenu);

/****************************************************************************************************/

function openAccountMenu(event)
{
  closeMenu();
  
  document.getElementById('navigation-account-icon').removeEventListener('click', openAccountMenu);

  $(document.getElementById('navigation-account-list')).slideDown(250, () =>
  {
    document.getElementById('navigation-account-icon').style.color = '#7EDA7E';

    document.getElementById('navigation-account-icon').addEventListener('click', closeAccountMenu);
  });
}

/****************************************************************************************************/

function closeAccountMenu(event)
{
  document.getElementById('navigation-account-icon').removeEventListener('click', closeAccountMenu);

  $(document.getElementById('navigation-account-list')).slideUp(250, () =>
  {
    document.getElementById('navigation-account-icon').removeAttribute('style');

    document.getElementById('navigation-account-icon').addEventListener('click', openAccountMenu);
  });
}

/****************************************************************************************************/