/****************************************************************************************************/

if(document.getElementById('navigation-apps-icon'))
{
  document.getElementById('navigation-apps-icon').addEventListener('click', openOrCloseApps);
}

if(document.getElementById('navigation-menu-icon'))
{
  document.getElementById('navigation-menu-icon').addEventListener('click', openOrCloseMenuList);
}

/****************************************************************************************************/

function openOrCloseMenuList(event)
{
  if(document.getElementById('navigation-menu-list').hasAttribute('style'))
  {
    if(document.getElementById('navigation-apps-icon'))
    {
      document.getElementById('navigation-apps-icon').removeAttribute('style');
      document.getElementById('navigation-apps-icon').children[1].innerHTML = `<i class='fas fa-angle-down'></i>`;
      document.getElementById('navigation-apps-list').removeAttribute('style');
    }
    
    document.getElementById('navigation-menu-list').removeAttribute('style');
    document.getElementById('navigation-menu-icon').removeAttribute('style');
  }

  else
  {
    document.getElementById('navigation-menu-list').style.display = 'block';
    document.getElementById('navigation-menu-icon').style.color = '#7EDA7E';
  }
}

/****************************************************************************************************/

function openOrCloseApps(event)
{
  if(document.getElementById('navigation-apps-list').hasAttribute('style'))
  {
    document.getElementById('navigation-apps-icon').removeAttribute('style');
    document.getElementById('navigation-apps-icon').children[1].innerHTML = `<i class='fas fa-angle-down'></i>`;
    document.getElementById('navigation-apps-list').removeAttribute('style');
  }

  else
  {
    document.getElementById('navigation-apps-icon').style.color = '#428BCA';
    document.getElementById('navigation-apps-icon').children[1].innerHTML = `<i class='fas fa-angle-up'></i>`;
    document.getElementById('navigation-apps-list').style.display = 'block';
  }
}

/****************************************************************************************************/