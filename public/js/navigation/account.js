/****************************************************************************************************/

document.getElementById('navigation-account-icon').addEventListener('click', openOrCloseAccountList);

/****************************************************************************************************/

function openOrCloseAccountList(event)
{
  if(document.getElementById('navigation-account-list').hasAttribute('style'))
  {
    document.getElementById('navigation-account-list').removeAttribute('style');
    document.getElementById('navigation-account-icon').removeAttribute('style');
  }

  else
  {
    document.getElementById('navigation-account-list').style.display = 'block';
    document.getElementById('navigation-account-icon').style.color = '#7EDA7E';
  }
}

/****************************************************************************************************/