/****************************************************************************************************/

if(document.getElementById('displays'))
{
  const displays = document.getElementById('displays').children;

  for(var i = 0; i < displays.length; i++)
  {
    displays[i].addEventListener('click', changeDisplay);
  }
}

/****************************************************************************************************/

function changeDisplay(event)
{
  var target = event.target;

  while(target.hasAttribute('name') == false) target = target.parentNode;

  const selectedDisplay = target.getAttribute('name');

  if(target.hasAttribute('id')) return;

  const displays = document.getElementById('displays').children;

  for(var i = 0; i < displays.length; i++)
  {
    displays[i].setAttribute('class', 'storageServiceMainBlockFilesHeaderDisplaySelectionElementDisabled');
  }

  document.getElementById('selectedDisplay').removeAttribute('id');

  switch(selectedDisplay)
  {
    case 'largeGrid':
      target.setAttribute('id', 'selectedDisplay');
      target.setAttribute('class', 'storageServiceMainBlockFilesHeaderDisplaySelectionElementEnabled');
      return setLargeGridDisplay();

    case 'smallGrid':
      target.setAttribute('id', 'selectedDisplay');
      target.setAttribute('class', 'storageServiceMainBlockFilesHeaderDisplaySelectionElementEnabled');
      return setSmallGridDisplay();

    case 'list':
      target.setAttribute('id', 'selectedDisplay');
      target.setAttribute('class', 'storageServiceMainBlockFilesHeaderDisplaySelectionElementEnabled');
      return setListDisplay();
  }
}

/****************************************************************************************************/

function setListDisplay()
{
  if(document.getElementById('currentFolder') == null) return;

  const elements = document.getElementById('currentFolder').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('id') == false) elements[x].setAttribute('class', 'serviceElementsFileList');
  }
}

/****************************************************************************************************/

function setSmallGridDisplay()
{
  if(document.getElementById('currentFolder') == null) return;

  const elements = document.getElementById('currentFolder').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('id') == false) elements[x].setAttribute('class', 'serviceElementsFileSmallGrid');
  }
}

/****************************************************************************************************/

function setLargeGridDisplay()
{
  if(document.getElementById('currentFolder') == null) return;

  const elements = document.getElementById('currentFolder').children;

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('id') == false) elements[x].setAttribute('class', 'serviceElementsFileLargeGrid');
  }
}

/****************************************************************************************************/