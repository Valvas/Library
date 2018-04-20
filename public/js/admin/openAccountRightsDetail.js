/****************************************************************************************************/

var accounts = document.getElementById('account-list').children;

for(var i = 0; i< accounts.length; i++)
{
  accounts[i].addEventListener('click', openAccountRightsDetail);
}

/****************************************************************************************************/

function openAccountRightsDetail(event)
{
  var account = event.target;

  var getParentLoop = () => { account = account.parentNode; if(account.hasAttribute('name') == false) getParentLoop(); }

  if(account.hasAttribute('name') == false) getParentLoop();

  location = '/admin/rights/' + account.getAttribute('name');
}

/****************************************************************************************************/