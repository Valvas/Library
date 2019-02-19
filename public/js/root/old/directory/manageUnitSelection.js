/****************************************************************************************************/

var array = null, tagToDisplay = null;

var selectedLi = null;

function deployUnit()
{
  if(document.getElementById('directoryUnitsList') == null) return;

  var target = event.target.hasAttribute('onclick') ? event.target : event.target.parentNode;

  while(target.tagName === 'SPAN')
  {
    target = target.parentNode;
  }

  selectedLi = target;

  const selectedUnitName = selectedLi.hasAttribute('onclick') ? selectedLi.innerText : selectedLi.children[0].children[1].innerText;

  if(document.getElementById('selectedUnitValue')) document.getElementById('selectedUnitValue').innerText = selectedUnitName;

  if(document.getElementById('selectedList'))
  {
    document.getElementById('selectedList').children.length === 0
    ? document.getElementById('selectedList').setAttribute('class', 'directoryUnitValue')
    : document.getElementById('selectedList').children[0].setAttribute('class', 'directoryUnitValue');

    document.getElementById('selectedList').removeAttribute('id');
  }

  selectedLi.setAttribute('id', 'selectedList');

  selectedLi.children.length === 0
  ? selectedLi.setAttribute('class', 'directoryUnitValueSelected')
  : selectedLi.children[0].setAttribute('class', 'directoryUnitValueSelected');

  const currentUnit = document.getElementById('directoryUnitsList').children[0].children[0];

  array = [];
  tagToDisplay = null;

  browseList(currentUnit, false, () =>
  {
    displayAndHideLists(currentUnit, () =>
    {
      browseAccountsToDisplay();
    });
  });
}

/****************************************************************************************************/

function browseList(currentElement, isToBeDisplayed, callback)
{
  if(currentElement.children.length > 0)
  {
    if(currentElement === selectedLi) tagToDisplay = currentElement.children[0].getAttribute('tag');

    var index = 0, hasBeenFound = false;

    var loop = () =>
    {
      browseList(currentElement.children[1].children[index], false, (result) =>
      {
        if(result) hasBeenFound = true;

        if(currentElement.children[1].children[index += 1] != undefined) return loop();

        if(currentElement === selectedLi || hasBeenFound) array.push(currentElement);

        return callback(currentElement === selectedLi || hasBeenFound);
      });
    }

    loop();
  }

  else
  {
    if(currentElement === selectedLi) tagToDisplay = currentElement.getAttribute('tag');

    if(currentElement === selectedLi || isToBeDisplayed) array.push(currentElement);

    return callback(currentElement === selectedLi);
  }
}

/****************************************************************************************************/

function displayAndHideLists(currentElement, callback)
{
  if(currentElement.children.length === 0) return callback();
  
  var index = 0;

  var loop = () =>
  {
    displayAndHideLists(currentElement.children[1].children[index], () =>
    {
      array.includes(currentElement)
      ? currentElement.children[1].setAttribute('class', 'directoryUnit')
      : currentElement.children[1].setAttribute('class', 'directoryUnitHidden');

      array.includes(currentElement)
      ? currentElement.children[0].children[0].innerHTML = `<i class="fas fa-caret-down"></i>`
      : currentElement.children[0].children[0].innerHTML = `<i class="fas fa-caret-right"></i>`;
      
      if(currentElement.children[1].children[index += 1] != undefined) return loop();

      return callback();
    });
  }

  loop();
}

/****************************************************************************************************/

function browseAccountsToDisplay()
{
  var accountsDisplayed = 0;

  if(document.getElementById('accountsList') == null) return;
  if(document.getElementById('directorySearchForAccounts') == null) return;

  const accounts = document.getElementById('accountsList').children;

  for(var x = 0; x < accounts.length; x++)
  {
    const accountTags = accounts[x].getAttribute('tag').split(',');

    var isSearched = false, isToBeDisplayed = false;

    if(accounts[x].children[1].children[0].innerText.toLowerCase().includes(document.getElementById('directorySearchForAccounts').value.toLowerCase())) isSearched = true;
    if(accounts[x].children[1].children[1].innerText.toLowerCase().includes(document.getElementById('directorySearchForAccounts').value.toLowerCase())) isSearched = true;
    if(accountTags.includes(tagToDisplay)) isToBeDisplayed = true;

    isToBeDisplayed && isSearched
    ? accounts[x].removeAttribute('style')
    : accounts[x].style.display = 'none';

    if(isToBeDisplayed && isSearched) accountsDisplayed += 1;
  }

  accountsDisplayed === 0
  ? document.getElementById('accountsEmpty').style.display = 'block'
  : document.getElementById('accountsEmpty').removeAttribute('style');
}

/****************************************************************************************************/