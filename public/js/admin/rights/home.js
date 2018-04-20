/****************************************************************************************************/

var pages = document.getElementById('account-pages').children;

var x = 0;

var addListenerLoop = () =>
{
  pages[x].addEventListener('click', changeAccountListPage);

  if(pages[x += 1] != undefined) addListenerLoop();
}

if(pages[x] != undefined) addListenerLoop();

/****************************************************************************************************/

var accounts = document.getElementById('account-list').children;

var x = 0;

var addListenerLoop = () =>
{
  accounts[x].addEventListener('click', openAccountRightsDetail);

  if(accounts[x += 1] != undefined) addListenerLoop();
}

if(accounts[x] != undefined) addListenerLoop();

/****************************************************************************************************/

function changeAccountListPage(event)
{
  if(event.target.getAttribute('id') == null && event.target.getAttribute('class') != 'page inactive')
  {
    var selectedPage = document.getElementById('selected-page');

    selectedPage.removeAttribute('id');

    event.target.setAttribute('id', 'selected-page');
    event.target.setAttribute('class', 'page selected');

    updateAccountListPages();
  }
}

/****************************************************************************************************/

function openAccountRightsDetail(event)
{
  var account = event.target;

  var getParentLoop = () =>
  {
    account = account.parentNode;

    if(account.hasAttribute('name') == false) getParentLoop();
  }

  if(account.hasAttribute('name') == false) getParentLoop();

  location = '/admin/rights/' + account.getAttribute('name');
}

/****************************************************************************************************/