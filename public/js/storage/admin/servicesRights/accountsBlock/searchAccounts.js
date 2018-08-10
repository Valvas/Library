/****************************************************************************************************/

function searchAccounts()
{
  var x = 0;
  var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;

  var browseAccountsWithRegex = () =>
  {
    var accountMatchesRegex = false;

    if(accounts[x].children[1].innerText.match(document.getElementById('rightsOnServicesHomeAccountsBlockSearch').value) != null) accountMatchesRegex = true;
    if(accounts[x].children[2].innerText.match(document.getElementById('rightsOnServicesHomeAccountsBlockSearch').value) != null) accountMatchesRegex = true;
    if(accounts[x].children[3].innerText.match(document.getElementById('rightsOnServicesHomeAccountsBlockSearch').value) != null) accountMatchesRegex = true;

    if(accountMatchesRegex == true)
    {
      accounts[x].setAttribute('name', 'displayed');

      if(document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked)
      {
        checkAccount(accounts[x]);
      }
    }

    else
    {
      accounts[x].removeAttribute('name');
      uncheckAccount(accounts[x]);
    }

    if(accounts[x += 1] != undefined) browseAccountsWithRegex();

    else
    {
      updateAccountsBlockPages();
    }
  }

  if(accounts[x] != undefined) browseAccountsWithRegex();
}

/****************************************************************************************************/