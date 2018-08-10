/****************************************************************************************************/

applyDetailClickEventOnFiles();

/****************************************************************************************************/

function applyDetailClickEventOnFiles()
{
  var elements = document.getElementById('filesBlock').children;

  for(var x = 0; x < elements.length; x++)
  { 
    if(elements[x].hasAttribute('tag'))
    {
      elements[x].addEventListener('click', openFileDetail);
    }
  }
}

/****************************************************************************************************/

function openFileDetail(event)
{
  if(event.target.type !== 'checkbox')
  {
    var fileBlock = event.target;

    while(fileBlock.hasAttribute('id') == false)
    {
      fileBlock = fileBlock.parentElement;
    }

    const fileUuid = fileBlock.getAttribute('id');

    if((document.getElementById('elementDetailBlock') == null) || (document.getElementById('elementDetailBlock') && document.getElementById('elementDetailBlock').getAttribute('name') !== fileUuid))
    {
      if(document.getElementById('elementDetailBlock')) document.getElementById(document.getElementById('elementDetailBlock').getAttribute('name')).removeAttribute('style');

      closeDetailBlock();

      document.getElementById(fileUuid).style.backgroundColor = '#E5E5FF';

      var elementDetailBlock                = document.createElement('div');
      var elementDetailBlockTitle           = document.createElement('div');
      var elementDetailBlockClose           = document.createElement('div');
      var elementDetailBlockSpinner         = document.createElement('div');
      var elementDetailBlockNameLabel       = document.createElement('div');
      var elementDetailBlockNameValue       = document.createElement('div');
      var elementDetailBlockEvents          = document.createElement('div');
      var elementDetailBlockEventsTitle     = document.createElement('div');
      var elementDetailBlockEventsContent   = document.createElement('div');
      var elementDetailBlockEventsPages     = document.createElement('div');
      var elementDetailBlockComment         = document.createElement('button');

      elementDetailBlock                .setAttribute('id', 'elementDetailBlock');
      elementDetailBlock                .setAttribute('name', fileUuid);

      elementDetailBlockEventsContent   .setAttribute('id', 'elementDetailBlockEventsContent');
      elementDetailBlockEventsPages     .setAttribute('id', 'elementDetailBlockEventsPages');
      
      elementDetailBlock                .setAttribute('class', 'elementDetailBlock');
      elementDetailBlockClose           .setAttribute('class', 'elementDetailBlockClose');
      elementDetailBlockTitle           .setAttribute('class', 'elementDetailBlockTitle');
      elementDetailBlockSpinner         .setAttribute('class', 'elementDetailBlockSpinner');
      elementDetailBlockNameLabel       .setAttribute('class', 'elementDetailBlockLabel');
      elementDetailBlockNameValue       .setAttribute('class', 'elementDetailBlockValue');
      elementDetailBlockEvents          .setAttribute('class', 'elementDetailBlockEvents');
      elementDetailBlockEventsTitle     .setAttribute('class', 'elementDetailBlockEventsTitle');
      elementDetailBlockEventsContent   .setAttribute('class', 'elementDetailBlockEventsContent');
      elementDetailBlockEventsPages     .setAttribute('class', 'elementDetailBlockEventsPages');

      elementDetailBlockSpinner         .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
      elementDetailBlockClose           .innerHTML = '<i class="fas fa-arrow-right"></i>';

      elementDetailBlockClose           .addEventListener('click', closeDetailBlock);

      elementDetailBlock                .appendChild(elementDetailBlockClose);
      elementDetailBlock                .appendChild(elementDetailBlockSpinner);

      $(elementDetailBlock).hide().appendTo(document.getElementById('mainBlock'));

      $(elementDetailBlock).toggle('slide', { direction: 'right' }, 200);

      $.ajax(
      {
        method: 'GET',
        dataType: 'json',
        timeout: 5000,
        url: '/queries/storage/strings',
    
        error: (xhr, textStatus, errorThrown) =>
        {
          closeDetailBlock();

          document.getElementById(fileUuid).removeAttribute('style');
    
          xhr.responseJSON != undefined
          ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
          : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
        }
    
      }).done((json) =>
      {
        const strings = json.strings;

        $.ajax(
        {
          method: 'PUT',
          dataType: 'json',
          timeout: 5000,
          data: { fileUuid: fileUuid },
          url: '/queries/storage/services/get-file-logs',
      
          error: (xhr, textStatus, errorThrown) =>
          {
            closeDetailBlock();
  
            document.getElementById(fileUuid).removeAttribute('style');
      
            xhr.responseJSON != undefined
            ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
            : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
          }
      
        }).done((json) =>
        {
          const fileLogs = json.fileLogs;
          
          $.ajax(
          {
            method: 'PUT',
            dataType: 'json',
            timeout: 5000,
            data: { serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
            url: '/queries/storage/services/get-rights-for-service',
        
            error: (xhr, textStatus, errorThrown) =>
            {
              closeDetailBlock();
      
              document.getElementById(folderUuid).removeAttribute('style');
      
              xhr.responseJSON != undefined
              ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
              : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
            }
        
          }).done((json) =>
          {
            const rights = json.rights;

            for(var x = 0; x < Math.ceil(fileLogs.length / 8); x++)
            {
              if(x >= 8) break;

              var elementDetailBlockEventsPagesElement = document.createElement('div');

              x == 0
              ? elementDetailBlockEventsPagesElement.setAttribute('class', 'elementDetailBlockEventsPagesElementSelected')
              : elementDetailBlockEventsPagesElement.setAttribute('class', 'elementDetailBlockEventsPagesElement');

              elementDetailBlockEventsPagesElement.innerText = (x + 1);

              elementDetailBlockEventsPagesElement.setAttribute('tag', x);

              if(x !== 0) elementDetailBlockEventsPagesElement.addEventListener('click', switchEventsPage);

              elementDetailBlockEventsPages.appendChild(elementDetailBlockEventsPagesElement);
            }

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

              if(x >= 8) eventDetail.style.display = 'none';

              elementDetailBlockEventsContent.appendChild(eventDetail);
            }

            elementDetailBlockSpinner.remove();

            elementDetailBlockTitle         .innerText = strings.services.fileDetail.title;
            elementDetailBlockNameLabel     .innerText = strings.services.fileDetail.fileName;
            elementDetailBlockNameValue     .innerText = document.getElementById(fileUuid).innerText;
            elementDetailBlockEventsTitle   .innerText = strings.services.fileDetail.events;
            elementDetailBlockComment       .innerText = strings.services.fileDetail.commentButton.label;

            rights.commentFiles
            ? elementDetailBlockComment.setAttribute('title', strings.services.fileDetail.commentButton.titles.true)
            : elementDetailBlockComment.setAttribute('title', strings.services.fileDetail.commentButton.titles.false);

            rights.commentFiles
            ? elementDetailBlockComment.setAttribute('class', 'elementDetailBlockComment')
            : elementDetailBlockComment.setAttribute('class', 'elementDetailBlockCommentOff');

            if(rights.commentFiles) elementDetailBlockComment.addEventListener('click', () => { openCommentPopup(fileUuid); });

            elementDetailBlockEvents        .appendChild(elementDetailBlockEventsTitle);
            elementDetailBlockEvents        .appendChild(elementDetailBlockEventsContent);
            elementDetailBlockEvents        .appendChild(elementDetailBlockEventsPages);

            elementDetailBlock              .appendChild(elementDetailBlockTitle);
            elementDetailBlock              .appendChild(elementDetailBlockNameLabel);
            elementDetailBlock              .appendChild(elementDetailBlockNameValue);
            elementDetailBlock              .appendChild(elementDetailBlockEvents);
            elementDetailBlock              .appendChild(elementDetailBlockComment);
          });
        });
      });
    }

    else
    {
      document.getElementById(document.getElementById('elementDetailBlock').getAttribute('name')).removeAttribute('style');

      closeDetailBlock();
    }
  }
}

/****************************************************************************************************/

function openFolderDetail(folderUuid)
{
  var elementDetailBlock                = document.createElement('div');
  var elementDetailBlockTitle           = document.createElement('div');
  var elementDetailBlockClose           = document.createElement('div');
  var elementDetailBlockSpinner         = document.createElement('div');
  var elementDetailBlockNameLabel       = document.createElement('div');
  var elementDetailBlockNameValue       = document.createElement('div');
  var elementDetailBlockContentLabel    = document.createElement('div');
  var elementDetailBlockContentFiles    = document.createElement('div');
  var elementDetailBlockContentFolders  = document.createElement('div');
  var elementDetailBlockRenameButton    = document.createElement('button');
  var elementDetailBlockRemoveButton    = document.createElement('button');

  elementDetailBlock                .setAttribute('id', 'elementDetailBlock');
  elementDetailBlock                .setAttribute('name', folderUuid);
  
  elementDetailBlock                .setAttribute('class', 'elementDetailBlock');
  elementDetailBlockClose           .setAttribute('class', 'elementDetailBlockClose');
  elementDetailBlockTitle           .setAttribute('class', 'elementDetailBlockTitle');
  elementDetailBlockSpinner         .setAttribute('class', 'elementDetailBlockSpinner');
  elementDetailBlockNameLabel       .setAttribute('class', 'elementDetailBlockLabel');
  elementDetailBlockNameValue       .setAttribute('class', 'elementDetailBlockValue');
  elementDetailBlockContentLabel    .setAttribute('class', 'elementDetailBlockLabel');
  elementDetailBlockContentFiles    .setAttribute('class', 'elementDetailBlockValue');
  elementDetailBlockContentFolders  .setAttribute('class', 'elementDetailBlockValue');
  elementDetailBlockRemoveButton    .setAttribute('class', 'elementDetailBlockRemove');

  elementDetailBlockRenameButton    .addEventListener('click', () => { renameFolder(folderUuid, document.getElementById(folderUuid).innerText); });

  elementDetailBlockSpinner         .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
  elementDetailBlockClose           .innerHTML = '<i class="fas fa-arrow-right"></i>';

  elementDetailBlockClose           .addEventListener('click', closeDetailBlock);

  elementDetailBlock                .appendChild(elementDetailBlockClose);
  elementDetailBlock                .appendChild(elementDetailBlockSpinner);

  $(elementDetailBlock).hide().appendTo(document.getElementById('mainBlock'));

  $(elementDetailBlock).toggle('slide', { direction: 'right' }, 200);

  $.ajax(
  {
    method: 'GET',
    dataType: 'json',
    timeout: 5000,
    url: '/queries/storage/strings',

    error: (xhr, textStatus, errorThrown) =>
    {
      closeDetailBlock();

      document.getElementById(folderUuid).removeAttribute('style');

      xhr.responseJSON != undefined
      ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
      : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
    }

  }).done((json) =>
  {
    const strings = json.strings;

    $.ajax(
    {
      method: 'PUT',
      dataType: 'json',
      timeout: 5000,
      data: { serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
      url: '/queries/storage/services/get-rights-for-service',
  
      error: (xhr, textStatus, errorThrown) =>
      {
        closeDetailBlock();

        document.getElementById(folderUuid).removeAttribute('style');

        xhr.responseJSON != undefined
        ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
        : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
      }
  
    }).done((json) =>
    {
      const rights = json.rights;

      $.ajax(
      {
        method: 'PUT',
        dataType: 'json',
        data: { folderUuid: folderUuid, serviceUuid: document.getElementById('mainBlock').getAttribute('name') },
        timeout: 5000,
        url: '/queries/storage/services/get-folder-content',
    
        error: (xhr, textStatus, errorThrown) =>
        {
          closeDetailBlock();
    
          xhr.responseJSON != undefined
          ? displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail)
          : displayErrorMessage('Une erreur est survenue, veuillez réessayer plus tard', null);
        }
    
      }).done((json) =>
      {
        elementDetailBlockSpinner.remove();
  
        elementDetailBlockTitle           .innerText = strings.services.folderDetail.title;
        elementDetailBlockNameLabel       .innerText = strings.services.folderDetail.folderName;
        elementDetailBlockNameValue       .innerText = document.getElementById(folderUuid).innerText;
        elementDetailBlockContentLabel    .innerText = strings.services.folderDetail.folderContent;
        elementDetailBlockContentFiles    .innerText = `- ${json.result.files.length} ${strings.services.folderDetail.files}`;
        elementDetailBlockContentFolders  .innerText = `- ${json.result.folders.length} ${strings.services.folderDetail.folders}`;
        elementDetailBlockRenameButton    .innerText = strings.services.folderDetail.renameButton.label;
        elementDetailBlockRemoveButton    .innerText = strings.services.folderDetail.removeButton.label;

        rights.renameFolders
        ? elementDetailBlockRenameButton.setAttribute('class', 'elementDetailBlockRename')
        : elementDetailBlockRenameButton.setAttribute('class', 'elementDetailBlockRenameOff');

        rights.renameFolders
        ? elementDetailBlockRenameButton.setAttribute('title', strings.services.folderDetail.renameButton.titles.true)
        : elementDetailBlockRenameButton.setAttribute('title', strings.services.folderDetail.renameButton.titles.false);
  
        rights.removeFolders
        ? elementDetailBlockRemoveButton.setAttribute('title', strings.services.folderDetail.removeButton.titles.true)
        : elementDetailBlockRemoveButton.setAttribute('title', strings.services.folderDetail.removeButton.titles.false);
    
        elementDetailBlock                .appendChild(elementDetailBlockTitle);
        elementDetailBlock                .appendChild(elementDetailBlockNameLabel);
        elementDetailBlock                .appendChild(elementDetailBlockNameValue);
        elementDetailBlock                .appendChild(elementDetailBlockContentLabel);
        elementDetailBlock                .appendChild(elementDetailBlockContentFiles);
        elementDetailBlock                .appendChild(elementDetailBlockContentFolders);
        elementDetailBlock                .appendChild(elementDetailBlockRenameButton);
        elementDetailBlock                .appendChild(elementDetailBlockRemoveButton);
      });
    });
  });
}

/****************************************************************************************************/

function closeDetailBlock()
{
  if(document.getElementById('elementDetailBlock'))
  {
    document.getElementById(document.getElementById('elementDetailBlock').getAttribute('name')).removeAttribute('style');

    $(document.getElementById('elementDetailBlock')).toggle('slide', { direction: 'right' }, 200, () => { if(document.getElementById('elementDetailBlock')) document.getElementById('elementDetailBlock').remove(); });
  }
}

/****************************************************************************************************/

function switchEventsPage(event)
{
  const pageTag     = parseInt(event.target.getAttribute('tag'));
  var events        = document.getElementById('elementDetailBlockEventsContent').children;

  document.getElementById('elementDetailBlockEventsPages').innerHTML = '';

  var startPage = null, endPage = null;

  startPage = (pageTag - 4) > 0 ? (pageTag - 4) : 0;
  endPage = Math.ceil(events.length / 8) > (startPage + 7) ? (startPage + 7) : Math.ceil(events.length / 8);

  event.target.removeEventListener('click', switchEventsPage);

  for(var x = startPage; x < endPage; x++)
  {
    var pageSelector = document.createElement('div');

    pageSelector.innerText = (x + 1);

    x === pageTag
    ? pageSelector.setAttribute('class', 'elementDetailBlockEventsPagesElementSelected')
    : pageSelector.setAttribute('class', 'elementDetailBlockEventsPagesElement');

    if(x !== pageTag) pageSelector.addEventListener('click', switchEventsPage);

    pageSelector.setAttribute('tag', x);

    document.getElementById('elementDetailBlockEventsPages').appendChild(pageSelector);
  }

  for(var x = 0; x < events.length; x++)
  {
    events[x].getAttribute('tag') == pageTag
    ? events[x].removeAttribute('style')
    : events[x].style.display = 'none';
  }
}

/****************************************************************************************************/