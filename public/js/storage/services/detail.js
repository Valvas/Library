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

      elementDetailBlock                .setAttribute('id', 'elementDetailBlock');
      elementDetailBlock                .setAttribute('name', fileUuid);
      
      elementDetailBlock                .setAttribute('class', 'elementDetailBlock');
      elementDetailBlockClose           .setAttribute('class', 'elementDetailBlockClose');
      elementDetailBlockTitle           .setAttribute('class', 'elementDetailBlockTitle');
      elementDetailBlockSpinner         .setAttribute('class', 'elementDetailBlockSpinner');
      elementDetailBlockNameLabel       .setAttribute('class', 'elementDetailBlockLabel');
      elementDetailBlockNameValue       .setAttribute('class', 'elementDetailBlockValue');
      elementDetailBlockEvents          .setAttribute('class', 'elementDetailBlockEvents');
      elementDetailBlockEventsTitle     .setAttribute('class', 'elementDetailBlockEventsTitle');

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

        elementDetailBlockSpinner.remove();

        elementDetailBlockTitle         .innerText = strings.services.fileDetail.title;
        elementDetailBlockNameLabel     .innerText = strings.services.fileDetail.fileName;
        elementDetailBlockNameValue     .innerText = document.getElementById(fileUuid).innerText;
        elementDetailBlockEventsTitle   .innerText = strings.services.fileDetail.events;

        elementDetailBlockEvents        .appendChild(elementDetailBlockEventsTitle);

        elementDetailBlock              .appendChild(elementDetailBlockTitle);
        elementDetailBlock              .appendChild(elementDetailBlockNameLabel);
        elementDetailBlock              .appendChild(elementDetailBlockNameValue);
        elementDetailBlock              .appendChild(elementDetailBlockEvents);
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
  elementDetailBlockRenameButton    .setAttribute('class', 'elementDetailBlockRename');
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
      elementDetailBlockRenameButton    .innerText = strings.services.folderDetail.rename;
      elementDetailBlockRemoveButton    .innerText = strings.services.folderDetail.remove;
  
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