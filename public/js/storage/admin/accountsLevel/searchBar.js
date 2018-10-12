/****************************************************************************************************/

if(document.getElementById('searchBar')) document.getElementById('searchBar').addEventListener('input', searchForAccounts);

/****************************************************************************************************/

function searchForAccounts(event)
{
  const searchValue = event.target.value.toLowerCase();

  if(document.getElementById('accountsTable'))
  {
    const tableRows = document.getElementById('accountsTable').children[0].children;

    for(var x = 0; x < tableRows.length; x++)
    {
      if(tableRows[x].hasAttribute('name') && tableRows[x].getAttribute('name') === 'accountRow')
      {
        var isToBeDisplayed = false;

        if(tableRows[x].children[0].innerText.toLowerCase().includes(searchValue)) isToBeDisplayed = true;
        if(tableRows[x].children[1].innerText.toLowerCase().includes(searchValue)) isToBeDisplayed = true;
        if(tableRows[x].children[2].innerText.toLowerCase().includes(searchValue)) isToBeDisplayed = true;

        isToBeDisplayed
        ? tableRows[x].removeAttribute('style')
        : tableRows[x].style.display = 'none';
      }
    }
  }
}

/****************************************************************************************************/