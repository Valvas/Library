/****************************************************************************************************/

var pages = document.getElementById('account-pages').children;

var x = 0;

var addListennerLoop = () =>
{
  pages[x].addEventListener('click', changeAccountListPage);

  if(pages[x += 1] != undefined) addListennerLoop();
}

if(pages[x] != undefined) addListennerLoop();

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