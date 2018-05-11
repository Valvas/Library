/****************************************************************************************************/

function selectAccount(event)
{
  var x = 0;
  var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;

  var amountOfAccounts = accounts.length;
  var amountOfAccountsChecked = 0;

  var browseAccounts = () =>
  {
    if(accounts[x].children[0].children[0].checked == true) amountOfAccountsChecked += 1;

    if(accounts[x += 1] != undefined) browseAccounts();

    else
    {
      if(event.target.checked == true)
      {
        if(document.getElementById('rightsOnServicesHomeAccountsBlockAdd'))
        {
          var buttonText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0];
          buttonText += ' (' + (parseInt(document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[1].slice(1, -1), 10) + 1) + ')';

          document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = buttonText;
        }

        if(amountOfAccountsChecked == amountOfAccounts)
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
  }

  browseAccounts();
}

/****************************************************************************************************/

function selectAllAccounts(event)
{
  event.target.indeterminate = false;

  var x = 0;
  var accounts = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;

  var accountsToSelect = [];
  var accountsSelected = [];

  var browseAccountsToGetThoseDisplayed = () =>
  {
    if(accounts[x].hasAttribute('name')) accountsToSelect.push(accounts[x]);

    if(accounts[x].children[0].children[0].checked) accountsSelected.push(accounts[x]);

    if(accounts[x += 1] != undefined) browseAccountsToGetThoseDisplayed();

    else
    {
      x = 0;

      if(accountsToSelect[x] != undefined) browseAccountsToSelect();
    }
  }

  var browseAccountsToSelect = () =>
  {
    if(accountsSelected.length > 0)
    {
      accountsToSelect[x].children[0].children[0].checked = false;
    }

    else
    {
      accountsToSelect[x].children[0].children[0].checked = true;
    }

    if(accountsToSelect[x += 1] != undefined) browseAccountsToSelect();

    else
    {
      var buttonText = document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText.split(' ')[0];

      if(accountsSelected.length > 0)
      {
        event.target.checked = false;
        buttonText += ' (0)';
      }

      else
      {
        event.target.checked = true;
        buttonText += ' (' + accountsToSelect.length + ')';
      }

      document.getElementById('rightsOnServicesHomeAccountsBlockAdd').innerText = buttonText;
    }
  }

  if(accounts[x] != undefined) browseAccountsToGetThoseDisplayed();
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