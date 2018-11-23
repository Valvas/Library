/****************************************************************************************************/

if(document.getElementById('accountSearch')) document.getElementById('accountSearch').addEventListener('input', searchForAccounts);

/****************************************************************************************************/

function searchForAccounts(event)
{
  const accounts = document.getElementsByName('accountBlock');

  var accountsToDisplay = [];

  for(var x = 0; x < accounts.length; x++)
  {
    var isToBeDisplayed = false;

    if(accounts[x].children[0].innerText.toLowerCase().includes(event.target.value.toLowerCase())) isToBeDisplayed = true;
    if(accounts[x].children[1].innerText.toLowerCase().includes(event.target.value.toLowerCase())) isToBeDisplayed = true;
    if(accounts[x].children[2].innerText.toLowerCase().includes(event.target.value.toLowerCase())) isToBeDisplayed = true;

    isToBeDisplayed
    ? accountsToDisplay.push(accounts[x])
    : accounts[x].style.display = 'none';
  }

  for(var x = 0; x < accountsToDisplay.length; x++)
  {
    (x % 2) === 0
    ? accountsToDisplay[x].setAttribute('class', 'accountsBlockOdd accessVersion')
    : accountsToDisplay[x].setAttribute('class', 'accountsBlockEven accessVersion');

    accountsToDisplay[x].removeAttribute('style');
  }
}

/****************************************************************************************************/