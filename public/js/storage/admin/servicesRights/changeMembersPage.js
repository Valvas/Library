/****************************************************************************************************/

function changeMembersPage(pageTag)
{
  var x = 0;

  var pages = document.getElementById('rightsOnServicesHomeMembersBlockPages').children;

  var browsePages = () =>
  {
    pages[x].removeAttribute('onclick');

    if(parseInt(pages[x].getAttribute('tag'), 10) == pageTag) pages[x].setAttribute('class', 'membersBlockListPagesElementSelected');

    else{ pages[x].setAttribute('class', 'membersBlockListPagesElementInactive'); }

    pages[x += 1] != undefined ? browsePages() : updateMembersPages();
  }

  browsePages();
}

/****************************************************************************************************/

function updateMembersPages()
{
  var x = 0;
  var pageSelectors = document.getElementById('rightsOnServicesHomeMembersBlockPages').children;
  var members = document.getElementById('rightsOnServicesHomeMembersBlockListAccounts').children;
  var selectedPage = null, firstPage = null, lastPage = null;

  var browsePageSelectorsToFindSelectedPage = () =>
  {
    if(pageSelectors[x].getAttribute('class') == 'membersBlockListPagesElementSelected')
    {
      parseInt(pageSelectors[x].getAttribute('tag'), 10) >= Math.ceil(members.length / 10) ?
      selectedPage = Math.ceil(members.length / 10) - 1 :
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

    if((firstPage + x) == selectedPage && members.length > 0) pageSelectors[x].setAttribute('class', 'membersBlockListPagesElementSelected');

    else if(x < Math.ceil(members.length / 10))
    {
      pageSelectors[x].setAttribute('class', 'membersBlockListPagesElementActive');
      pageSelectors[x].setAttribute('onclick', 'changeMembersPage(' + (firstPage + x) + ')');
    }

    else{ pageSelectors[x].setAttribute('class', 'membersBlockListPagesElementInactive'); }

    if(pageSelectors[x += 1] != undefined) browsePageSelectors();

    else
    {
      x = 0;

      if(members[x] != undefined) browseAccounts();

      else
      {
        $(document.getElementById('rightsOnServicesHomeMembersBlockEmpty')).fadeIn(250);
      }
    }
  }

  var browseAccounts = () =>
  {
    members[x].setAttribute('tag', Math.floor(x / 10));

    if(Math.floor(x / 10) == selectedPage) members[x].removeAttribute('style');

    else{ members[x].style.display = 'none'; }

    if(members[x += 1] != undefined) browseAccounts();
  }

  browsePageSelectorsToFindSelectedPage();
}

/****************************************************************************************************/