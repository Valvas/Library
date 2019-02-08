/****************************************************************************************************/

var selectedUnit = null;
var tagToDisplay = '0';

/****************************************************************************************************/

function deployUnit()
{
  event.stopPropagation();

  selectedUnit = event.target;

  while(selectedUnit.nodeName !== 'LI')
  {
    selectedUnit = selectedUnit.parentNode;
  }

  tagToDisplay = selectedUnit.getAttribute('tag');

  const treeChildren = document.getElementById('directorySectionTree').children;

  for(var x = 0; x < treeChildren.length; x++)
  {
    browseUnitsTree(treeChildren[x], selectedUnit, tagToDisplay);
  }

  browseAccountsToDisplay(tagToDisplay);
}

/****************************************************************************************************/

function browseUnitsTree(currentElement, selectedUnit, tagToDisplay)
{
  currentElement === selectedUnit
  ? currentElement.setAttribute('class', 'directorySectionTreeElementSelected')
  : currentElement.setAttribute('class', 'directorySectionTreeElement');

  currentElement === selectedUnit
  ? currentElement.removeAttribute('onclick')
  : currentElement.setAttribute('onclick', 'deployUnit()');

  if(currentElement.getAttribute('tag').length > tagToDisplay.length)
  {
    if(currentElement.getElementsByTagName('ul').length > 0)
    {
      currentElement.getElementsByTagName('ul')[0].setAttribute('class', 'directorySectionTreeListHidden');

      for(var x = 0; x < currentElement.getElementsByTagName('ul')[0].children.length; x++)
      {
        browseUnitsTree(currentElement.getElementsByTagName('ul')[0].children[x], selectedUnit, tagToDisplay);
      }
    }
  }

  else
  {
    if(currentElement.getElementsByTagName('ul').length > 0)
    {
      var isToBeDisplayed = true;

      for(var x = 0; x < currentElement.getAttribute('tag').length; x++)
      {
        if(currentElement.getAttribute('tag')[x] !== tagToDisplay[x]) isToBeDisplayed = false;
      }

      isToBeDisplayed
      ? currentElement.getElementsByTagName('ul')[0].setAttribute('class', 'directorySectionTreeList')
      : currentElement.getElementsByTagName('ul')[0].setAttribute('class', 'directorySectionTreeListHidden');

      for(var x = 0; x < currentElement.getElementsByTagName('ul')[0].children.length; x++)
      {
        browseUnitsTree(currentElement.getElementsByTagName('ul')[0].children[x], selectedUnit, tagToDisplay);
      }
    }
  }
}

/****************************************************************************************************/

function browseAccountsToDisplay()
{
  const searchedValue = document.getElementById('directorySectionSearch').value.trim().toLowerCase();

  document.getElementById('directorySectionEmpty').removeAttribute('style');

  const accounts = document.getElementById('directorySectionList').children;

  var counter = 0;

  for(var x = 0; x < accounts.length; x++)
  {
    const accountIdentity = accounts[x].getElementsByClassName('directorySectionAccountContentIdentityName')[0].innerText.toLowerCase();

    var isToBeDisplayed = accountIdentity.includes(searchedValue);

    for(var y = 0; y < tagToDisplay.length; y++)
    {
      if(accounts[x].getAttribute('name')[y] !== tagToDisplay[y]) isToBeDisplayed = false;
    }

    if(isToBeDisplayed) counter += 1;

    isToBeDisplayed
    ? accounts[x].removeAttribute('style')
    : accounts[x].style.display = 'none';
  }

  if(counter === 0) document.getElementById('directorySectionEmpty').style.display = 'block';
}

/****************************************************************************************************/
