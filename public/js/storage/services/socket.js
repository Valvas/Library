/****************************************************************************************************/

var socket = io();

/****************************************************************************************************/

socket.on('connect', () =>
{
  socket.emit('storageAppServicesDetailJoin', document.getElementById('mainBlock').getAttribute('name'));
});

/****************************************************************************************************/

socket.on('fileUploaded', (file, folderUuid) =>
{
  displayMessageToInformationBlock(`Le fichier "${file.name}.${file.extension}" vient d'être ajouté`);

  if(document.getElementById(file.uuid)) document.getElementById(file.uuid).remove();
  
  if(document.getElementById('currentPath').children[document.getElementById('currentPath').children.length - 1].getAttribute('name') === folderUuid)
  {
    addFile(file);
  }
});

/****************************************************************************************************/

socket.on('fileRemoved', (fileUuid) =>
{
  if(document.getElementById(fileUuid))
  {
    displayMessageToInformationBlock(`Le fichier "${document.getElementById(fileUuid).innerText.slice(0, -1)}" vient d'être surpprimé`);

    document.getElementById(fileUuid).remove();
  }

  if(document.getElementById('elementDetailBlock') && document.getElementById('elementDetailBlock').getAttribute('name') === fileUuid)
  {
    $(document.getElementById('elementDetailBlock')).toggle('slide', { direction: 'right' }, 250, () => { document.getElementById('elementDetailBlock').remove(); });
  }
});

/****************************************************************************************************/

socket.on('updateFileLogs', (fileUuid, fileLogs) =>
{
  if(document.getElementById('elementDetailBlock') && document.getElementById('elementDetailBlock').getAttribute('name') === fileUuid)
  {
    var pageSelectors = document.getElementById('elementDetailBlockEventsPages').children;
    var firstPage = null, lastPage = null, currentPage = null;

    for(var x = 0; x < pageSelectors.length; x++)
    {
      if(pageSelectors[x].getAttribute('class') == 'elementDetailBlockEventsPagesElementSelected') currentPage = parseInt(pageSelectors[x].getAttribute('tag'));
    }

    firstPage = (currentPage - 4) < 0 ? 0 : (currentPage - 4);
    lastPage = Math.ceil(fileLogs.length / 8) > (firstPage + 7) ? (firstPage + 7) : Math.ceil(fileLogs.length / 8);

    document.getElementById('elementDetailBlockEventsPages').innerHTML = '';

    for(var x = firstPage; x < lastPage; x++)
    {
      var pageSelector = document.createElement('div');

      x === currentPage
      ? pageSelector.setAttribute('class', 'elementDetailBlockEventsPagesElementSelected')
      : pageSelector.setAttribute('class', 'elementDetailBlockEventsPagesElement');

      pageSelector.innerText = (x + 1);
      pageSelector.setAttribute('tag', x);

      if(x !== currentPage) pageSelector.addEventListener('click', switchEventsPage);

      document.getElementById('elementDetailBlockEventsPages').appendChild(pageSelector);
    }

    document.getElementById('elementDetailBlockEventsContent').innerHTML = '';

    for(var x = 0; x < fileLogs.length; x++)
    {
      var eventDetail           = document.createElement('div');
      var eventDetailDate       = document.createElement('div');
      var eventDetailMessage    = document.createElement('div');

      eventDetail               .setAttribute('tag', Math.floor(x / 8));

      eventDetailDate           .innerText = `[${fileLogs[fileLogs.length - (x + 1)].date}]`;
      eventDetailMessage        .innerText = fileLogs[fileLogs.length - (x + 1)].message;

      switch(fileLogs[fileLogs.length - (x + 1)].type)
      {
        case 0: eventDetail.setAttribute('class', 'elementDetailBlockEventsContentElement zero'); break;
        case 1: eventDetail.setAttribute('class', 'elementDetailBlockEventsContentElement one'); break;
        case 2: eventDetail.setAttribute('class', 'elementDetailBlockEventsContentElement two'); break;
        case 3:
        
          eventDetail.setAttribute('class', 'elementDetailBlockEventsContentElement three');

          var eventDetailComment = document.createElement('div');

          eventDetailComment.setAttribute('class', 'elementDetailBlockEventsContentElementComment');

          eventDetailComment.innerText = fileLogs[fileLogs.length - (x + 1)].comment;

          eventDetail.appendChild(eventDetailComment);
          
        break;
      }

      eventDetail               .insertBefore(eventDetailDate, eventDetail.children[0]);
      eventDetail               .insertBefore(eventDetailMessage, eventDetail.children[1]);

      if(Math.floor(x / 8) !== currentPage) eventDetail.style.display = 'none';

      document.getElementById('elementDetailBlockEventsContent').appendChild(eventDetail);
    }
  }
});

/****************************************************************************************************/

socket.on('folderCreated', (folderData, parentFolderUuid) =>
{
  if(document.getElementById('currentPath').children[document.getElementById('currentPath').children.length - 1].getAttribute('name') === parentFolderUuid)
  {
    addFolder(folderData);
  }
});

/****************************************************************************************************/

socket.on('folderNameUpdated', (folderUuid, newFolderName) =>
{
  if(document.getElementById(folderUuid))
  {
    document.getElementById(folderUuid).children[1].innerText = newFolderName;
  }

  if(document.getElementById('elementDetailBlock') && document.getElementById('elementDetailBlock').getAttribute('name') === folderUuid)
  {
    document.getElementById('elementDetailBlock').children[3].innerText = newFolderName;
  }
});

/****************************************************************************************************/