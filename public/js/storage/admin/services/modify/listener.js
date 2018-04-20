/****************************************************************************************************/

var modifyButtons = document.getElementsByName('serviceBlockModifyButton');

/****************************************************************************************************/

var x = 0;

var browseButtonsLoop = () =>
{
  var name = modifyButtons[x].parentNode.getAttribute('name');

  modifyButtons[x].addEventListener('click', () => { location = '/storage/admin/services/detail/' + name });

  if(modifyButtons[x += 1] != undefined) browseButtonsLoop();
}

if(modifyButtons[x] != undefined) browseButtonsLoop();

/****************************************************************************************************/