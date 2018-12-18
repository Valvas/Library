/****************************************************************************************************/

if(document.getElementById('filesAndFoldersSearchBar')) document.getElementById('filesAndFoldersSearchBar').addEventListener('input', searchForFilesAndFolders);

/****************************************************************************************************/

function searchForFilesAndFolders(event)
{
  const currentFiles = document.getElementById('filesContainer').children;
  const currentFolders = document.getElementById('foldersContainer').children;

  for(var x = 0; x < currentFolders.length; x++)
  {
    var index = 1;

    if(currentFolders[x].children.length > 2) index += 1;

    currentFolders[x].children[index].innerText.includes(event.target.value)
    ? currentFolders[x].removeAttribute('style')
    : currentFolders[x].style.display = 'none';
  }

  for(var x = 0; x < currentFiles.length; x++)
  {
    var index = 1;

    if(currentFiles[x].children.length > 2) index += 1;

    if(currentFiles[x].children[index].innerText.includes(event.target.value))
    {
      currentFiles[x].removeAttribute('style');

      continue;
    }

    currentFiles[x].style.display = 'none';

    if(currentFiles[x].children[0].tagName === 'INPUT' && currentFiles[x].children[0].checked) currentFiles[x].children[0].click();
  }
}

/****************************************************************************************************/