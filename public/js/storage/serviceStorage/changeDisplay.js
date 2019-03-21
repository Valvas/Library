/****************************************************************************************************/

function changeDisplay(event)
{
  const displaySelected = event.target.options[event.target.selectedIndex].value;

  selectedDisplay = displaySelected;

  document.cookie = 'storageDisplay=xxxx;Max-Age=0;path=/';
  document.cookie = `storageDisplay=${selectedDisplay};Max-Age=${60 * 60 * 24 * 365 * 10};path=/`;

  const currentFiles    = document.getElementById('currentServiceFilesContainer').children;
  const currentFolders  = document.getElementById('currentServiceFoldersContainer').children;

  switch(displaySelected)
  {
    case 'small':

      for(var x = 0; x < currentFolders.length; x++) currentFolders[x].setAttribute('class', 'serviceFolderSmall');
      for(var x = 0; x < currentFiles.length; x++) currentFiles[x].setAttribute('class', 'serviceFileSmall');

    break;

    case 'large':

      for(var x = 0; x < currentFolders.length; x++) currentFolders[x].setAttribute('class', 'serviceFolderLarge');
      for(var x = 0; x < currentFiles.length; x++) currentFiles[x].setAttribute('class', 'serviceFileLarge');

    break;

    case 'list':

      for(var x = 0; x < currentFolders.length; x++) currentFolders[x].setAttribute('class', 'serviceFolderList');
      for(var x = 0; x < currentFiles.length; x++) currentFiles[x].setAttribute('class', 'serviceFileList');

    break;
  }
}

/****************************************************************************************************/
