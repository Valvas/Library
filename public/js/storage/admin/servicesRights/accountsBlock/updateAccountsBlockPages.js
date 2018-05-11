/****************************************************************************************************/

function updateAccountsBlockPages()
{
  var x = 0;
  var pageSelectors = document.getElementById('rightsOnServicesHomeAccountsBlockListPages').children;
  var members = document.getElementById('rightsOnServicesHomeAccountsBlockListElements').children;
  var selectedPage = null, firstPage = null, lastPage = null, accountsToDisplay = [];

  var browseAccountsToGetThoseToDisplay = () =>
  {
    if(members[x].hasAttribute('name')) accountsToDisplay.push(members[x]);

    else
    {
      members[x].style.display = 'none';
    }

    if(members[x += 1] != undefined) browseAccountsToGetThoseToDisplay();

    else
    {
      x = 0;

      browsePageSelectorsToFindSelectedPage();
    }
  }

  var browsePageSelectorsToFindSelectedPage = () =>
  {
    if(pageSelectors[x].getAttribute('class') == 'accountsBlockListPagesElementSelected')
    {
      parseInt(pageSelectors[x].getAttribute('tag'), 10) >= Math.ceil(accountsToDisplay.length / 10) ?
      selectedPage = Math.ceil(accountsToDisplay.length / 10) - 1 :
      selectedPage = parseInt(pageSelectors[x].getAttribute('tag'), 10);

      selectedPage - 4 < 0 ? firstPage = 0 : firstPage = selectedPage - 4;
      lastPage = firstPage + 9;

      x = 0;

      browsePageSelectors();
    }

    else if(pageSelectors[x += 1] != undefined) browsePageSelectorsToFindSelectedPage();

    else
    {
      selectedPage = 0;
      firstPage = 0;
      lastPage = 9;
      x = 0;

      browsePageSelectors();
    }
  }

  var browsePageSelectors = () =>
  {
    pageSelectors[x].setAttribute('tag', (firstPage + x));
    pageSelectors[x].innerText = (firstPage + x) + 1;

    if((firstPage + x) == selectedPage && accountsToDisplay.length > 0) pageSelectors[x].setAttribute('class', 'accountsBlockListPagesElementSelected');

    else if(x < Math.ceil(accountsToDisplay.length / 10))
    {
      pageSelectors[x].setAttribute('class', 'accountsBlockListPagesElementActive');
      pageSelectors[x].setAttribute('onclick', 'changeAccountsBlockPage(' + (firstPage + x) + ')');
    }

    else{ pageSelectors[x].setAttribute('class', 'accountsBlockListPagesElementInactive'); }

    if(pageSelectors[x += 1] != undefined) browsePageSelectors();

    else
    {
      x = 0;

      if(accountsToDisplay[x] != undefined)
      {
        document.getElementById('rightsOnServicesHomeAccountsBlockListEmpty').style.display = 'none';
        
        browseAccountsToDisplayThoseFromSelectedPage();
      }

      else
      {
        $(document.getElementById('rightsOnServicesHomeAccountsBlockListEmpty')).fadeIn(250);
      }
    }
  }

  var browseAccountsToDisplayThoseFromSelectedPage = () =>
  {
    accountsToDisplay[x].setAttribute('tag', Math.floor(x / 10));

    if(Math.floor(x / 10) == selectedPage) accountsToDisplay[x].removeAttribute('style');

    else{ accountsToDisplay[x].style.display = 'none'; }

    if(accountsToDisplay[x += 1] != undefined) browseAccountsToDisplayThoseFromSelectedPage();
  }

  members[x] != undefined ? browseAccountsToGetThoseToDisplay() : browsePageSelectorsToFindSelectedPage();
}

/****************************************************************************************************/