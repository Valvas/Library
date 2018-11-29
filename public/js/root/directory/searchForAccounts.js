/****************************************************************************************************/

if(document.getElementById('directorySearchForAccounts')) document.getElementById('directorySearchForAccounts').addEventListener('input', searchForAccounts);

/****************************************************************************************************/

function searchForAccounts(event)
{
  if(document.getElementById('accountsList') == null) return;

  const currentAccounts = document.getElementById('accountsList').children;

  var accountsToDisplay = 0;

  for(var x = 0; x < currentAccounts.length; x++)
  {
    var isToBeDisplayed = false;

    if(currentAccounts[x].children[1].children[0].innerText.toLowerCase().includes(event.target.value.toLowerCase())) isToBeDisplayed = true;
    if(currentAccounts[x].children[1].children[1].innerText.toLowerCase().includes(event.target.value.toLowerCase())) isToBeDisplayed = true;

    isToBeDisplayed
    ? currentAccounts[x].removeAttribute('style')
    : currentAccounts[x].style.display = 'none';

    if(isToBeDisplayed)
    {
      accountsToDisplay += 1;

      document.getElementById('accountsEmpty').removeAttribute('style');
    }
  }

  if(accountsToDisplay === 0) document.getElementById('accountsEmpty').style.display = 'block';
}

/****************************************************************************************************/