/****************************************************************************************************/

var displays = document.getElementById('display').children;

for(var i = 0; i < displays.length; i++)
{
  displays[i].addEventListener('click', changeDisplay);
}

/****************************************************************************************************/

function changeDisplay(event)
{
  var target = event.target;

  var getParentLoop = () =>
  {
    target = target.parentNode;

    if(target.hasAttribute('tag') == false) getParentLoop();
  }

  if(target.hasAttribute('tag') == false) getParentLoop();

  if(target.getAttribute('tag') == 'false')
  {
    var displays = document.getElementById('display').children;

    var x = 0;

    var setTagToFalse = () =>
    {
      displays[x].setAttribute('tag', 'false');
      displays[x].setAttribute('class', 'choice false');
      displays[x].removeAttribute('id');

      if(displays[x += 1] != undefined) setTagToFalse();
    }

    setTagToFalse();

    target.setAttribute('tag', 'true');
    target.setAttribute('class', 'choice true');
    target.setAttribute('id', 'selectedDisplay');

    switch(target.getAttribute('name'))
    {
      case 'list': setListDisplay(); break;
      case 'small': setSmallGridDisplay(); break;
      case 'large': setLargeGridDisplay(); break;
      default: setLargeGridDisplay(); break;
    }
  }
}

/****************************************************************************************************/

function setListDisplay()
{
  var elements = document.getElementById('filesBlock').children;
  var files = [];
  var folders = [];

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('tag')) files.push(elements[x]);

    else if(elements[x].hasAttribute('name'))
    {
      elements[x].setAttribute('class', 'storageAppServiceReturnList');
      elements[x].children[0].setAttribute('class', 'storageAppServiceReturnBackgroundList');
      elements[x].children[1].setAttribute('class', 'storageAppServiceReturnIconList');

      if(elements[x].children[2]) elements[x].children[2].setAttribute('class', 'storageAppServiceReturnNameList');
    }

    else
    {
      folders.push(elements[x]);
    }
  }

  for(var i = 0; i < files.length; i++)
  {
    files[i].setAttribute('class', 'storageAppServicesFilesList');
    files[i].children[0].setAttribute('class', 'storageAppServicesFilesListIcon' + ' ' + files[i].children[0].getAttribute('class').split(' ')[1]);
    files[i].children[1].setAttribute('class', 'storageAppServicesFilesListName');

    if(files[i].children[2]) files[i].children[2].setAttribute('class', 'storageAppServicesFilesListCheckbox');
  }

  for(var i = 0; i < folders.length; i++)
  {
    folders[i].setAttribute('class', 'storageAppServiceFolderList');

    folders[i].children[0].setAttribute('class', 'storageAppServiceFolderListIcon');
    folders[i].children[1].setAttribute('class', 'storageAppServiceFolderListName');

    if(folders[i].children[2]) folders[i].children[2].setAttribute('class', 'storageAppServiceFolderListCheckbox');
  }
}

/****************************************************************************************************/

function setSmallGridDisplay()
{
  var elements = document.getElementById('filesBlock').children;
  var files = [];
  var folders = [];

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('tag')) files.push(elements[x]);

    else if(elements[x].hasAttribute('name'))
    {
      elements[x].setAttribute('class', 'storageAppServiceReturnSmall');
      elements[x].children[0].setAttribute('class', 'storageAppServiceReturnBackgroundSmall');
      elements[x].children[1].setAttribute('class', 'storageAppServiceReturnIconSmall');

      if(elements[x].children[2]) elements[x].children[2].setAttribute('class', 'storageAppServiceReturnNameSmall');
    }

    else
    {
      folders.push(elements[x]);
    }
  }

  for(var i = 0; i < files.length; i++)
  {
    files[i].setAttribute('class', 'storageAppServicesFilesSmall');
    files[i].children[0].setAttribute('class', 'storageAppServicesFilesSmallIcon' + ' ' + files[i].children[0].getAttribute('class').split(' ')[1]);
    files[i].children[1].setAttribute('class', 'storageAppServicesFilesSmallName');

    if(files[i].children[2]) files[i].children[2].setAttribute('class', 'storageAppServicesFilesSmallCheckbox');
  }

  for(var i = 0; i < folders.length; i++)
  {
    folders[i].setAttribute('class', 'storageAppServiceFolderSmall');

    folders[i].children[0].setAttribute('class', 'storageAppServiceFolderSmallIcon');
    folders[i].children[1].setAttribute('class', 'storageAppServiceFolderSmallName');

    if(folders[i].children[2]) folders[i].children[2].setAttribute('class', 'storageAppServiceFolderSmallCheckbox');
  }
}

/****************************************************************************************************/

function setLargeGridDisplay()
{
  var elements = document.getElementById('filesBlock').children;
  var files = [];
  var folders = [];

  for(var x = 0; x < elements.length; x++)
  {
    if(elements[x].hasAttribute('tag')) files.push(elements[x]);

    else if(elements[x].hasAttribute('name'))
    {
      elements[x].setAttribute('class', 'storageAppServiceReturnLarge');
      elements[x].children[0].setAttribute('class', 'storageAppServiceReturnBackgroundLarge');
      elements[x].children[1].setAttribute('class', 'storageAppServiceReturnIconLarge');

      if(elements[x].children[2]) elements[x].children[2].setAttribute('class', 'storageAppServiceReturnNameLarge');
    }

    else
    {
      folders.push(elements[x]);
    }
  }

  for(var i = 0; i < files.length; i++)
  {
    files[i].setAttribute('class', 'storageAppServicesFilesLarge');
    files[i].children[0].setAttribute('class', 'storageAppServicesFilesLargeIcon' + ' ' + files[i].children[0].getAttribute('class').split(' ')[1]);
    files[i].children[1].setAttribute('class', 'storageAppServicesFilesLargeName');

    if(files[i].children[2]) files[i].children[2].setAttribute('class', 'storageAppServicesFilesLargeCheckbox');
  }

  for(var i = 0; i < folders.length; i++)
  {
    folders[i].setAttribute('class', 'storageAppServiceFolderLarge');
    folders[i].children[0].setAttribute('class', 'storageAppServiceFolderLargeIcon');
    folders[i].children[1].setAttribute('class', 'storageAppServiceFolderLargeName');

    if(folders[i].children[2]) folders[i].children[2].setAttribute('class', 'storageAppServiceFolderLargeCheckbox');
  }
}

/****************************************************************************************************/