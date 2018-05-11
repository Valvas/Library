/****************************************************************************************************/

function changeAccountsBlockPage(pageTag)
{
  var x = 0;

  var pages = document.getElementById('rightsOnServicesHomeAccountsBlockListPages').children;

  var browsePages = () =>
  {
    pages[x].removeAttribute('onclick');
    
    if(parseInt(pages[x].getAttribute('tag'), 10) == pageTag) pages[x].setAttribute('class', 'accountsBlockListPagesElementSelected');

    else{ pages[x].setAttribute('class', 'accountsBlockListPagesElementInactive'); }

    pages[x += 1] != undefined ? browsePages() : updateAccountsBlockPages();
  }

  browsePages();
}

/****************************************************************************************************/