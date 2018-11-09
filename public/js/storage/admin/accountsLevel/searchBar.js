/****************************************************************************************************/

if(document.getElementById('searchBar')) document.getElementById('searchBar').addEventListener('input', searchForAccounts);

/****************************************************************************************************/

function searchForAccounts(event)
{
  const searchValue = event.target.value.toLowerCase();

  if(document.getElementById('accountsList') == null) return;

  const accounts = document.getElementById('accountsList').children;

  for(var x = 0; x < accounts.length; x++)
  {
    accounts[x].children[0].innerText.toLowerCase().includes(searchValue)
    ? accounts[x].removeAttribute('style')
    : accounts[x].style.display = 'none';
  }
}

/****************************************************************************************************/