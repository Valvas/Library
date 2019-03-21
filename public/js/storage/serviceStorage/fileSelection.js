/****************************************************************************************************/

function fileSelected(event)
{
  var selectedFile = event.target;

  if(selectedFile.getAttribute('id') === 'fileContextMenu') return;

  while(selectedFile.hasAttribute('name') == false)
  {
    selectedFile = selectedFile.parentNode;
    if(selectedFile.getAttribute('id') === 'fileContextMenu') return;
  }

  if(event.target.tagName !== 'INPUT')
  {
    selectedFile.getElementsByTagName('input')[0].checked = selectedFile.getElementsByTagName('input')[0].checked ? false : true;
  }

  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  var counter = 0;

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getElementsByTagName('input').length === 0) continue;

    if(currentFiles[x].getElementsByTagName('input')[0].checked) counter += 1;
  }

  document.getElementById('serviceStorageContainerToolsCounterValue').innerText = counter;

  if(counter === 0)
  {
    document.getElementById('serviceStorageUnselectFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
    document.getElementById('serviceStorageUnselectFiles').removeEventListener('click', unselectAllFiles);

    if(document.getElementById('serviceStorageDownloadFiles'))
    {
      document.getElementById('serviceStorageDownloadFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
      document.getElementById('serviceStorageDownloadFiles').removeEventListener('click', downloadFiles);
    }

    if(document.getElementById('serviceStorageRemoveFiles'))
    {
      document.getElementById('serviceStorageRemoveFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
      document.getElementById('serviceStorageRemoveFiles').removeEventListener('click', removeFilesOpenPrompt);
    }
  }

  else
  {
    document.getElementById('serviceStorageUnselectFiles').setAttribute('class', 'serviceStorageContainerToolsActionsActivatedButton');
    document.getElementById('serviceStorageUnselectFiles').addEventListener('click', unselectAllFiles);

    if(document.getElementById('serviceStorageDownloadFiles'))
    {
      document.getElementById('serviceStorageDownloadFiles').setAttribute('class', 'serviceStorageContainerToolsActionsActivatedButton');
      document.getElementById('serviceStorageDownloadFiles').addEventListener('click', downloadFiles);
    }

    if(document.getElementById('serviceStorageRemoveFiles'))
    {
      document.getElementById('serviceStorageRemoveFiles').setAttribute('class', 'serviceStorageContainerToolsActionsRemoveButton');
      document.getElementById('serviceStorageRemoveFiles').addEventListener('click', removeFilesOpenPrompt);
    }
  }
}

/****************************************************************************************************/

function checkFileSelection()
{
  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  var counter = 0;

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getElementsByTagName('input').length === 0) continue;

    if(currentFiles[x].getElementsByTagName('input')[0].checked) counter += 1;
  }

  document.getElementById('serviceStorageContainerToolsCounterValue').innerText = counter;

  if(counter > 0) return;

  document.getElementById('serviceStorageUnselectFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  document.getElementById('serviceStorageUnselectFiles').removeEventListener('click', unselectAllFiles);

  document.getElementById('serviceStorageDownloadFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  document.getElementById('serviceStorageDownloadFiles').removeEventListener('click', downloadFiles);

  document.getElementById('serviceStorageRemoveFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  document.getElementById('serviceStorageRemoveFiles').removeEventListener('click', removeFilesOpenPrompt);
}

/****************************************************************************************************/

function unselectAllFiles()
{
  const currentFiles = document.getElementById('currentServiceFilesContainer').children;

  for(var x = 0; x < currentFiles.length; x++)
  {
    if(currentFiles[x].getElementsByTagName('input').length === 0) continue;

    currentFiles[x].getElementsByTagName('input')[0].checked = false;
  }

  document.getElementById('serviceStorageUnselectFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  document.getElementById('serviceStorageUnselectFiles').removeEventListener('click', unselectAllFiles);

  document.getElementById('serviceStorageDownloadFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  document.getElementById('serviceStorageDownloadFiles').removeEventListener('click', downloadFiles);

  document.getElementById('serviceStorageRemoveFiles').setAttribute('class', 'serviceStorageContainerToolsActionsDisabledButton');
  document.getElementById('serviceStorageRemoveFiles').removeEventListener('click', removeFilesOpenPrompt);

  document.getElementById('serviceStorageContainerToolsCounterValue').innerText = '0';
}

/****************************************************************************************************/
