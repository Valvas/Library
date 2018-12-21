/****************************************************************************************************/

var array = null, tagToDisplay = null;

var selectedLi = null;

function deployUnit()
{
  if(document.getElementById('directoryUnitsList') == null) return;

  const target = event.target.hasAttribute('onclick') ? event.target : event.target.parentNode;
  selectedLi = target.tagName === 'SPAN' ? target.parentNode : target;

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

  browseList(currentUnit, (result) =>
  {
    displayAndHideLists(currentUnit, () =>
    {
      browseAccountsToDisplay();
    });
  });
}

/****************************************************************************************************/

function browseList(currentElement, callback)
{
  if(currentElement.children.length > 0)
  {
    array.push(currentElement);

    if(currentElement === selectedLi) tagToDisplay = currentElement.children[0].getAttribute('tag');
    
    var index = 0;

    var loop = () =>
    {
      browseList(currentElement.children[1].children[index], (result) =>
      {
        if(result == false) array.pop();

        if(result) return callback();
        
        if(currentElement.children[1].children[index += 1] != undefined) return loop();

        return callback(currentElement === selectedLi);
      });
    }

    loop();
  }

  else
  {
    array.push(currentElement);

    if(currentElement === selectedLi) tagToDisplay = currentElement.getAttribute('tag');

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