/****************************************************************************************************/

var removeButtons = document.getElementsByName('serviceBlockRemoveButton');

/****************************************************************************************************/

var x = 0;

var browseButtonsLoop = () =>
{
  removeButtons[x].addEventListener('click', openRemovePopup);

  if(removeButtons[x += 1] != undefined) browseButtonsLoop();
}

if(removeButtons[x] != undefined) browseButtonsLoop();

/****************************************************************************************************/