/****************************************************************************************************/

function updateAccountListPages()
{
  var accounts                = document.getElementById('account-list').children;
  var selectedPage            = null;
  var amountOfPagesRequired   = Math.ceil(accounts.length / 10) < 10 ? 10 : Math.ceil(accounts.length / 10);

  if(document.getElementById('selected-page') != null) selectedPage = parseInt(document.getElementById('selected-page').getAttribute('tag'));

  var startPage = null, endPage = null;

  if(selectedPage == null)
  {
    startPage = 0;
    endPage = 9;
  }

  else
  {
    if(selectedPage >= amountOfPagesRequired)
    {
      endPage = parseInt(amountOfPagesRequired - 1);
      selectedPage = endPage;
    }

    else
    {
      if(selectedPage + 5 > amountOfPagesRequired - 1) endPage = parseInt(amountOfPagesRequired - 1);

      else
      {
        endPage = parseInt(selectedPage + 5);
      }
    }

    if(endPage < 9) endPage = 9;

    startPage = endPage - 9 < 0 ? 0 : endPage - 9;console.log(selectedPage, startPage, endPage);
  }

  var pages = document.getElementById('account-pages').children;

  var x = 0;

  var pagesLoop = () =>
  {
    pages[x].innerText = startPage + 1 + x;
    pages[x].setAttribute('tag', startPage + x);

    if(startPage + x == selectedPage)
    {
      pages[x].setAttribute('id', 'selected-page');
      pages[x].setAttribute('class', 'page selected');
    }

    if(startPage + x >= Math.ceil(accounts.length / 10)) pages[x].setAttribute('class', 'page inactive');

    else
    {
      if(startPage + x != selectedPage) pages[x].setAttribute('class', 'page');
    }

    if(pages[x += 1] != undefined) pagesLoop();
  }

  pagesLoop();

  var x = 0;

  var loop = () =>
  {
    accounts[x].setAttribute('tag', parseInt(x / 10));

    if(selectedPage == null && x < 10) accounts[x].setAttribute('class', 'account show');

    else if(selectedPage != null && selectedPage == parseInt(x / 10)) accounts[x].setAttribute('class', 'account show');

    else
    {
      accounts[x].setAttribute('class', 'account hide');
    }

    if(accounts[x += 1] != undefined) loop();
  }

  if(accounts[x] != undefined) loop();
}

/****************************************************************************************************/