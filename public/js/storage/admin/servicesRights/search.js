/****************************************************************************************************/

if(document.getElementById('searchBar')) document.getElementById('searchBar').addEventListener('input', searchForUsers);

/****************************************************************************************************/

function searchForUsers(event)
{
  if(document.getElementById('accountsList') == null) return;

  const searchedValue = event.target.value.toLowerCase();

  const accountRows = document.getElementById('accountsList').children;

  for(var x = 0; x < accountRows.length; x++)
  {
    accountRows[x].children[0].innerText.toLowerCase().includes(searchedValue)
    ? accountRows[x].removeAttribute('style')
    : accountRows[x].style.display = 'none';
  }
}

/****************************************************************************************************/