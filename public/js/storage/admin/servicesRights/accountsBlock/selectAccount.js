/****************************************************************************************************/

function selectAccount(target)
{
  var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;

  var amountOfAccountsChecked = 0;

  for(var x = 0; x < accounts.length; x++)
  {
    if(accounts[x].children[0].children[0].checked == true) amountOfAccountsChecked += 1;
  }

  if(target.checked)
  {
    if(document.getElementById('rightsOnServicesHomeAccountsBlockAdd'))
    {
      var buttonText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0];
      buttonText += ' (' + (parseInt(document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[1].slice(1, -1), 10) + 1) + ')';

      document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = buttonText;
    }

    if(amountOfAccountsChecked == accounts.length)
    {
      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = false;
      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked = true;
    }

    else
    {
      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = true;
    }
  }

  else
  {
    if(document.getElementById('rightsOnServicesHomeAccountsBlockAdd'))
    {
      var buttonText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0];
      buttonText += ' (' + (parseInt(document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[1].slice(1, -1), 10) - 1) + ')';

      document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = buttonText;
    }

    if(amountOfAccountsChecked == 0)
    {
      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').checked = false;
      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = false;
    }

    else
    {
      document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = true;
    }
  }
}

/****************************************************************************************************/

function selectAllAccounts(target)
{
  target.indeterminate = false;

  var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;

  var accountsSelected = 0, accountsDisplayed = accounts.length;

  for(var x = 0; x < accounts.length; x++)
  {
    if(accounts[x].hasAttribute('name'))
    {
      if(accounts[x].children[0].children[0].checked) accountsSelected += 1;
    }

    else
    {
      accountsDisplayed -= 1;
    }
  }

  if(accountsDisplayed === accountsSelected)
  {
    target.checked = false;

    document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0] + ` (0)`;

    for(var x = 0; x < accounts.length; x++)
    {
      accounts[x].children[0].children[0].checked = false;
    }
  }

  else
  {
    target.checked = true;

    document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0] + ` (${accounts.length})`;

    for(var x = 0; x < accounts.length; x++)
    {
      accounts[x].children[0].children[0].checked = true;
    }
  }
}

/****************************************************************************************************/

function uncheckAccount(account)
{
  if(account.children[0].children[0].checked)
  {
    account.children[0].children[0].checked = false;

    var buttonText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0];
    buttonText += ' (' + (parseInt(document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[1].slice(1, -1), 10) - 1) + ')';

    document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = buttonText;

    if(document.querySelectorAll('input.accountsBlockListElementsAccountBoxInput:checked').length == 0) document.getElementById('rightsOnServicesHomeAccountsBlockSelectAll').indeterminate = false;
  }
}

/****************************************************************************************************/

function checkAccount(account)
{
  if(account.children[0].children[0].checked == false)
  {
    account.children[0].children[0].checked = true;

    var buttonText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0];
    buttonText += ' (' + (parseInt(document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[1].slice(1, -1), 10) + 1) + ')';

    document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = buttonText;
  }
}

/****************************************************************************************************/