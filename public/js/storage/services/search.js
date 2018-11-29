/****************************************************************************************************/

if(document.getElementById('filesAndFoldersSearchBar')) document.getElementById('filesAndFoldersSearchBar').addEventListener('input', searchForFilesAndFolders);

/****************************************************************************************************/

function searchForFilesAndFolders(event)
{
  const currentFiles = document.getElementById('currentFolder').children;

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].hasAttribute('id') == false)
    {
      var index = 1;

      if(currentFiles[x].children.length > 2) index += 1;

      currentFiles[x].children[index].innerText.includes(event.target.value)
      ? currentFiles[x].removeAttribute('style')
      : currentFiles[x].style.display = 'none';
    }
  }
}

/****************************************************************************************************/