/****************************************************************************************************/

if(document.getElementById('headerBlockNavigationAccountBlock'))
{
  document.getElementById('headerBlockNavigationAccountBlock').addEventListener('mouseenter', openAccountMenu);
  document.getElementById('headerBlockNavigationAccountBlock').addEventListener('mouseleave', closeAccountMenu);
}

/****************************************************************************************************/

function openAccountMenu(event)
{
  document.getElementById('headerBlockNavigationAccountBlockMenu').style.display = 'block';
}

/****************************************************************************************************/

function closeAccountMenu(event)
{
  document.getElementById('headerBlockNavigationAccountBlockMenu').removeAttribute('style');
}

/****************************************************************************************************/