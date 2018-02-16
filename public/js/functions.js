/****************************************************************************************************/

function createConfirmationPopup(object, popupID, popupName)
{
  var veil      = document.createElement('div');
  var info      = document.createElement('div');
  var popup     = document.createElement('div');
  var title     = document.createElement('div');
  var message   = document.createElement('div');

  var cancel    = document.createElement('button');
  var perform   = document.createElement('button');

  $(veil)       .attr({ id: 'veil',                     class: 'veil'});
  $(info)       .attr({ id: 'popup-info',               class: 'popup-info'});
  $(title)      .attr({ id: 'popup-title',              class: 'popup-title'});
  $(popup)      .attr({ id:  popupID,                   class: 'popup'});
  $(cancel)     .attr({ id: 'popup-cancel-button',      class: 'popup-cancel-button'});
  $(message)    .attr({ id: 'popup-message',            class: 'popup-message'});
  $(perform)    .attr({ id: 'popup-perform-button',     class: 'popup-perform-button'});

  if(popupName != undefined) $(popup).attr('name', popupName);

  $(info)       .text(object['info']        || '');
  $(title)      .text(object['title']       || 'Confirmation');
  $(cancel)     .text(object['cancel']      || 'Non');
  $(message)    .text(object['message']     || '');
  $(perform)    .text(object['perform']     || 'Oui');

  $(veil)       .appendTo('body');
  $(popup)      .appendTo('body');

  $(title)      .appendTo(popup);
  $(message)    .appendTo(popup);
  $(info)       .appendTo(popup);
  $(perform)    .appendTo(popup);
  $(cancel)     .appendTo(popup);
}

/****************************************************************************************************/

function createAdminUserEditPopup(currentValue, inputType, inputId)
{
  var veil      = document.createElement('div');
  var info      = document.createElement('div');
  var popup     = document.createElement('div');
  var title     = document.createElement('div');
  var message   = document.createElement('div');

  var value     = document.createElement('input');

  var cancel    = document.createElement('button');
  var perform   = document.createElement('button');

  $(veil)       .attr({ id: 'veil',                                 class: 'veil'});
  $(info)       .attr({ id: 'admin-users-popup-info',               class: 'admin-users-popup-info'});
  $(title)      .attr({ id: 'admin-users-popup-title',              class: 'admin-users-popup-title'});
  $(popup)      .attr({ id: 'admin-users-popup',                    class: 'admin-users-popup'});
  $(cancel)     .attr({ id: 'admin-users-popup-cancel',             class: 'admin-users-popup-cancel'});
  $(message)    .attr({ id: 'admin-users-popup-message',            class: 'admin-users-popup-message'});
  $(perform)    .attr({ id: 'admin-users-popup-perform',            class: 'admin-users-popup-perform'});

  $(value)      .attr({ id: 'admin-users-popup-value',              class: 'admin-users-popup-value',        type: inputType});

  $(info)       .text('popup_text');
  $(title)      .text('popup_title');
  $(cancel)     .text('Annuler');
  $(perform)    .text('Envoyer');
  $(message)    .text('popup_message'); 
  
  $(veil)       .appendTo('body');
  $(popup)      .appendTo('body');

  $(title)      .appendTo(popup);
  $(message)    .appendTo(popup);
  $(value)      .appendTo(popup);
  $(info)       .appendTo(popup);
  $(perform)    .appendTo(popup);
  $(cancel)     .appendTo(popup);
}

/****************************************************************************************************/

function openReportPopup(obj)
{
  $('#report-popup').remove();

  var veil              = document.createElement('div');
  var popup             = document.createElement('div');
  var title             = document.createElement('div');
  var listLabel         = document.createElement('div');
  var infoMessage       = document.createElement('div');
  var subjectLabel      = document.createElement('div');
  var descriptionLabel  = document.createElement('div');

  var subject           = document.createElement('input');
  var list              = document.createElement('select');
  var description       = document.createElement('textarea');

  var cancelButton      = document.createElement('button');
  var sendButton        = document.createElement('button');

  $(veil)               .attr({ id: 'veil',                                 class: 'veil'});
  $(popup)              .attr({ id: 'report-popup',                         class: 'report-popup'});
  $(infoMessage)        .attr({ id: 'report-popup-info',                    class: 'report-popup-info'});
  $(list)               .attr({ id: 'report-popup-list',                    class: 'report-popup-list'});
  $(sendButton)         .attr({ id: 'report-popup-send',                    class: 'report-popup-send'});
  $(listLabel)          .attr({ id: 'report-popup-list-label',              class: 'report-popup-label'});
  $(descriptionLabel)   .attr({ id: 'report-popup-description-label',       class: 'report-popup-label'});
  $(title)              .attr({ id: 'report-popup-title',                   class: 'report-popup-title'});
  $(subjectLabel)       .attr({ id: 'report-popup-subject-label',           class: 'report-popup-label'});
  $(cancelButton)       .attr({ id: 'report-popup-cancel',                  class: 'report-popup-cancel'});
  $(description)        .attr({ id: 'report-popup-description',             class: 'report-popup-description',        maxlength: '1024'});
  $(subject)            .attr({ id: 'report-popup-subject',                 class: 'report-popup-subject',            maxlength: '64',           type: 'text'});

  $(title)              .text(obj.title);
  $(listLabel)          .text(obj.listLabel);
  $(infoMessage)        .text(obj.infoMessage);
  $(subjectLabel)       .text(obj.subjectLabel);
  $(descriptionLabel)   .text(obj.descriptionLabel);

  $(cancelButton)       .text(`Annuler`);
  $(sendButton)         .text(`Envoyer`);
  
  $(`<option value=''></option>`).appendTo(list);

  for(var key in obj['list'])
  {
    $(`<option value='${key}'>${obj['list'][key]}</option>`).appendTo(list);
  }

  $(veil)               .appendTo('body');
  $(popup)              .appendTo('body');

  $(title)              .appendTo(popup);
  $(listLabel)          .appendTo(popup);
  $(list)               .appendTo(popup);
  $(subjectLabel)       .appendTo(popup);
  $(subject)            .appendTo(popup);
  $(descriptionLabel)   .appendTo(popup);
  $(description)        .appendTo(popup);
  $(sendButton)         .appendTo(popup);
  $(cancelButton)       .appendTo(popup);
  $(infoMessage)        .appendTo(popup);
}

/****************************************************************************************************/

function openReportCommentPopup(titleContent)
{
  $('#veil').remove();
  $('#report-comment-popup').remove();

  var veil              = document.createElement('div');
  var popup             = document.createElement('div');
  var title             = document.createElement('div');

  var description       = document.createElement('textarea');

  var cancelButton      = document.createElement('button');
  var sendButton        = document.createElement('button');

  $(veil)               .attr({ id: 'veil',                                 class: 'veil'});
  $(popup)              .attr({ id: 'report-comment-popup',                 class: 'report-popup'});
  $(sendButton)         .attr({ id: 'report-comment-popup-send',            class: 'report-popup-send'});
  $(title)              .attr({ id: 'report-comment-popup-title',           class: 'report-popup-title'});
  $(cancelButton)       .attr({ id: 'report-comment-popup-cancel',          class: 'report-popup-cancel'});
  $(description)        .attr({ id: 'report-comment-popup-description',     class: 'report-popup-description',        maxlength: '1024'});

  $(title)              .text(titleContent);

  $(cancelButton)       .html(`<i class="fa fa-times fa-fw" aria-hidden="true"></i>`);
  $(sendButton)         .html(`<i class="fa fa-paper-plane fa-fw" aria-hidden="true"></i>`);

  $(veil)               .appendTo('body');
  $(popup)              .appendTo('body');

  $(title)              .appendTo(popup);
  $(description)        .appendTo(popup);
  $(sendButton)         .appendTo(popup);
  $(cancelButton)       .appendTo(popup);
}

/****************************************************************************************************/

function openFileCommentPopup()
{
  $('#veil').remove();
  $('#report-comment-popup').remove();

  var veil              = document.createElement('div');
  var popup             = document.createElement('div');
  var title             = document.createElement('div');
  var error             = document.createElement('div');

  var spinner           = document.createElement('i');

  var description       = document.createElement('textarea');

  var cancelButton      = document.createElement('button');
  var sendButton        = document.createElement('button');

  $(veil)               .attr({ id: 'veil',                               class: 'veil'});
  $(popup)              .attr({ id: 'file-comment-popup',                 class: 'file-popup'});
  $(sendButton)         .attr({ id: 'file-comment-popup-send',            class: 'file-popup-send'});
  $(error)              .attr({ id: 'file-comment-popup-error',           class: 'file-popup-error'});
  $(title)              .attr({ id: 'file-comment-popup-title',           class: 'file-popup-title'});
  $(cancelButton)       .attr({ id: 'file-comment-popup-cancel',          class: 'file-popup-cancel'});
  $(description)        .attr({ id: 'file-comment-popup-description',     class: 'file-popup-description',        rows: 6,        maxlength: '1024'});

  $(spinner)            .attr({ id: 'file-comment-popup-spinner',         class: 'file-popup-spinner fa fa-circle-o-notch fa-spin fa-fw' });

  $(title)              .text('Poster un commentaire');

  $(cancelButton)       .html(`<i class="fa fa-times fa-fw" aria-hidden="true"></i>`);
  $(sendButton)         .html(`<i class="fa fa-paper-plane fa-fw" aria-hidden="true"></i>`);

  $(veil)               .appendTo('body');
  $(popup)              .appendTo('body');

  $(title)              .appendTo(popup);
  $(description)        .appendTo(popup);
  $(error)              .appendTo(popup);
  $(sendButton)         .appendTo(popup);
  $(cancelButton)       .appendTo(popup);

  $(spinner)            .hide().appendTo(popup);
}

/****************************************************************************************************/

function printError(message)
{
  $('#error-popup').remove();
  
  var errorMessage = document.createElement('div');

  $(errorMessage).attr({ id: 'error-popup', class: 'error-popup'});

  $(errorMessage).text(message || 'Une erreur est survenue.');

  $(errorMessage).hide().appendTo('#logs-block');

  $(errorMessage).slideDown(0, function()
  {
    var popup = this;

    setTimeout(function(){ $(popup).slideUp(500); setTimeout(function(){ $(popup).remove(); }, 500); }, 5000);
  });
}

/****************************************************************************************************/

function printSuccess(message)
{
  $('#success-popup').remove();
  
  var successPopup = document.createElement('div');

  $(successPopup).attr({ id: 'success-popup', class: 'success-popup'});

  $(successPopup).text(message || 'La requête a été traitée avec succès.');

  $(successPopup).hide().appendTo('#logs-block');

  $(successPopup).slideDown(0, function()
  {
    var popup = this;

    setTimeout(function(){ $(popup).slideUp(500); setTimeout(function(){ $(popup).remove(); }, 500); }, 5000);
  });
}

/****************************************************************************************************/

function printMessage(message)
{
  $('#message-popup').remove();
  
  var messagePopup = document.createElement('div');

  $(messagePopup).attr({ id: 'message-popup', class: 'message-popup'});

  $(messagePopup).text(message || '....');

  $(messagePopup).hide().appendTo('#logs-block');

  $(messagePopup).slideDown(0, function()
  {
    var popup = this;

    setTimeout(function(){ $(popup).slideUp(500); setTimeout(function(){ $(popup).remove(); }, 500); }, 5000);
  });
}

/****************************************************************************************************/

function openUploadFilePopup(object, ext)
{
  $('#upload-popup').remove();

  var close     = document.createElement('i');

  var veil      = document.createElement('div');
  var info      = document.createElement('div');
  var popup     = document.createElement('div');
  var title     = document.createElement('div');
  var message   = document.createElement('div');

  var input     = document.createElement('input');

  var perform   = document.createElement('button');

  $(veil)       .attr({ id: 'veil',                         class: 'veil'});
  $(info)       .attr({ id: 'upload-popup-info',            class: 'popup-info'});
  $(title)      .attr({ id: 'upload-popup-title',           class: 'popup-title'});
  $(popup)      .attr({ id: 'upload-popup',                 class: 'popup'});
  $(close)      .attr({ id: 'upload-popup-close',           class: 'fa fa-close popup-close-button'});
  $(message)    .attr({ id: 'upload-popup-message',         class: 'popup-message'});
  $(perform)    .attr({ id: 'upload-popup-perform-button',  class: 'popup-perform-button'});

  ext.length == 0 ?
  $(input)      .attr({ id: 'upload-popup-input',           class: 'popup-file-input',      type: 'file',     name: 'file',     accept: '*' }) :
  $(input)      .attr({ id: 'upload-popup-input',           class: 'popup-file-input',      type: 'file',     name: 'file',     accept: `${ext.join()}` });

  ext.length == 0 ?
  $(info)       .text('(Extensions acceptées: aucunes)') :
  $(info)       .text(`(Extensions acceptées: ${ext.join(', ')})`);

  $(title)      .text(object['title']                           || 'ENVOYER UN FICHIER');
  $(message)    .text(object['message']                         || 'Cliquez sur le button ci-dessous pour choisir un fichier sur votre appareil.');
  $(perform)    .text(object['perform']                         || 'Envoyer');

  $(veil)       .appendTo('body');
  $(popup)      .appendTo('body');

  $(close)      .appendTo(popup);
  $(title)      .appendTo(popup);
  $(message)    .appendTo(popup);
  $(info)       .appendTo(popup);
  $(input)      .appendTo(popup);
  $(perform)    .appendTo(popup);
}

/****************************************************************************************************/

function updateFilesList(service, callback)
{
  $.ajax(
  {
    type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: service }, url: '/service/get-files-list', success: () => {},
    error: (xhr, status, error) => { printError(xhr.responseJSON.message); }
                
  }).done((json) =>
  {
    var x = 0, y = 0;

    var loop = (file) =>
    {
      if(file['deleted'] == 0) y += 1;

      if($(`#${file['uuid']} [name="service-main-block-buttons"] [name="deleted"]`).length > 0 && file['deleted'] == 0)
      {
        $(`#${file['uuid']} [name="service-main-block-buttons"] [name="deleted"]`).remove();
        if(json['rights']['download_files'] == 1) $('<i name="service-main-block-buttons-download" class="fa fa-download service-main-block-file-buttons-download" aria-hidden="true"></i>').appendTo($(document.getElementById(file['uuid'])).find('[name="service-main-block-buttons"]'));
        if(json['rights']['remove_files'] == 1) $('<i name="service-main-block-buttons-delete" class="fa fa-trash service-main-block-file-buttons-delete" aria-hidden="true"></i>').appendTo($(document.getElementById(file['uuid'])).find('[name="service-main-block-buttons"]'));
      }

      else if($(`#${file['uuid']} [name="service-main-block-buttons"] [name="deleted"]`).length == 0 && file['deleted'] == 1)
      {
        $(document.getElementById(file['uuid'])).find('[name="service-main-block-buttons"]').html(`<div name='deleted' class='service-main-block-file-deleted'>Supprimé</div>`);
      }

      if(!document.getElementById(file['uuid']))
      {
        $(`<tr id='${file['uuid']}' tag='${file['name']}.${file['ext']}' name='service-main-block-file' class='file'><td class='name'>${file['name']}</td><td class='type'>${file['type']}</td><td class='account'>${file['account']}</td><td name='service-main-block-buttons' class='buttons'></td></tr>`).appendTo(document.getElementById('service-main-block-table'));
  
        if(file['deleted'] == 0)
        {
          if(json['rights']['download_files'] == 1) $('<i name="service-main-block-buttons-download" class="fa fa-download service-main-block-file-buttons-download" aria-hidden="true"></i>').appendTo($(document.getElementById(file['uuid'])).find('[name="service-main-block-buttons"]'));
          if(json['rights']['remove_files'] == 1) $('<i name="service-main-block-buttons-delete" class="fa fa-trash service-main-block-file-buttons-delete" aria-hidden="true"></i>').appendTo($(document.getElementById(file['uuid'])).find('[name="service-main-block-buttons"]'));
        }

        else
        {
          $(`<div name='deleted' class='service-main-block-file-deleted'>Supprimé</div>`).appendTo($(document.getElementById(file['uuid'])).find('[name="service-main-block-buttons"]'));
        }
      }

      else
      {
        document.getElementById(file.uuid).children[2].innerText = file.account;
      }

      Object.keys(json['files'])[x += 1] != undefined ? loop(json['files'][Object.keys(json['files'])[x]]) : callback();
    }

    json['files'].length > 0 ? loop(json['files'][Object.keys(json['files'])[x]]) : printMessage('Aucun fichier associé à ce service pour le moment.');

    document.getElementById('files-counter').innerText = `Fichiers : ${y}`;
  });
}

/****************************************************************************************************/

function checkTimeout(timeout, counter)
{
  if((timeout - counter) <= (timeout * 0.1) && (timeout - counter) > 0)
  {
    if(document.getElementById('afk-warning-popup') == null)
    {
      openWarningPopup((timeout - counter) / 1000);
    }

    else
    {
      $(document.getElementById('afk-warning-info')).text(`Temps restant avant déconnexion : ${(timeout - counter) / 1000} s`);
    }
  }

  else if((timeout - counter) <= 0)
  {
    $.ajax(
    {
      type: 'GET', timeout: 2000, url: '/logout', success: function(){},
      error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }                      
    }).done(function(){ location = '/'; });
  }
}

/****************************************************************************************************/

function openWarningPopup(remainingTime)
{
  var veil      = document.createElement('div');
  var info      = document.createElement('div');
  var popup     = document.createElement('div');
  var title     = document.createElement('div');
  var message   = document.createElement('div');


  $(veil)       .attr({ id: 'afk-warning-veil',               class: 'veil'});
  $(info)       .attr({ id: 'afk-warning-info',               class: 'popup-info'});
  $(title)      .attr({ id: 'afk-warning-title',              class: 'popup-title'});
  $(popup)      .attr({ id: 'afk-warning-popup',              class: 'popup'});
  $(message)    .attr({ id: 'afk-warning-message',            class: 'popup-message'});

  $(info)       .text(`Temps restant avant déconnexion : ${remainingTime} s`);
  $(title)      .text('ATTENTION');
  $(message)    .text('Une inactivité prolongée entraine une déconnexion automatique !');

  $(veil)       .appendTo('body');
  $(popup)      .appendTo('body');

  $(title)      .appendTo(popup);
  $(message)    .appendTo(popup);
  $(info)       .appendTo(popup);
}

/****************************************************************************************************/

function openInputPopup(obj)
{
  var veil      = document.createElement('div');
  var popup     = document.createElement('div');

  var input     = document.createElement('input');

  var confirm   = document.createElement('button');
  var cancel    = document.createElement('button');

  $(veil)       .attr({ id: 'user-edit-veil',           class: 'veil'});
  $(popup)      .attr({ id: 'user-edit-popup',          class: 'user-edit-popup'});

  $(input)      .attr({ id: 'user-edit-popup-input',    type: obj.type,       placeholder: obj.placeholder,       class: 'user-edit-popup-input',     name: obj.name });

  $(input)      .val(obj.value);

  $(confirm)    .attr({ id: 'user-edit-popup-confirm',  class: 'user-edit-popup-confirm '});
  $(cancel)     .attr({ id: 'user-edit-popup-cancel',  class: 'user-edit-popup-cancel '});

  $(confirm)    .html('Envoyer');
  $(cancel)     .html('Annuler');

  $(veil)       .appendTo('body');
  $(popup)      .appendTo('body');

  $(input)      .appendTo(popup);
  $(`</br>`)    .appendTo(popup);
  $(confirm)    .appendTo(popup);
  $(cancel)     .appendTo(popup);

  confirm.focus();
}

/****************************************************************************************************/

function openSelectPopup(obj)
{
  var veil      = document.createElement('div');
  var popup     = document.createElement('div');

  var select    = document.createElement('select');

  var confirm   = document.createElement('button');
  var cancel    = document.createElement('button');

  $(veil)       .attr({ id: 'user-edit-veil',           class: 'veil'});
  $(popup)      .attr({ id: 'user-edit-popup',          class: 'user-edit-popup'});

  $(select)     .attr({ id: 'user-edit-popup-input',    class: 'user-edit-popup-input',     name: obj.name });

  $(confirm)    .attr({ id: 'user-edit-popup-confirm',  class: 'user-edit-popup-confirm '});
  $(cancel)     .attr({ id: 'user-edit-popup-cancel',  class: 'user-edit-popup-cancel '});

  $(confirm)    .html('Envoyer');
  $(cancel)     .html('Annuler');

  var option  = document.createElement('option');
  
  $(option).appendTo(select);

  var x  = 0;

  var loop = () =>
  {
    var option  = document.createElement('option');

    $(option).attr('value', Object.keys(obj.values)[x]);

    $(option).text(obj.values[Object.keys(obj.values)[x]]);

    $(option).appendTo(select);

    if(Object.keys(obj.values)[x += 1] != undefined) loop();

    else
    {
      $(veil)       .appendTo('body');
      $(popup)      .appendTo('body');

      $(select)     .appendTo(popup);
      $(confirm)    .appendTo(popup);
      $(cancel)     .appendTo(popup);

      confirm.focus();
    }
  }

  loop();
}

/****************************************************************************************************/

function updateFileLogs(fileUUID)
{
  $.ajax(
  {
    type: 'PUT', timeout: 5000, dataType: 'JSON', data: { file: fileUUID }, url: '/file/get-file', success: () => {},
    error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                    
  }).done((json) =>
  {
    var updatedLogs = [];
    var x = 0, y = 0, z = 0, a = 0, b = 0;
    var currentLogs = document.getElementsByName('log');

    var putUpdatedLogsInArrayLoop = () =>
    {
      updatedLogs.push(String(json.file.logs[x]['id']));

      if(json.file.logs[x += 1] != undefined) putUpdatedLogsInArrayLoop();
    }

    if(json.file.logs[x] != undefined) putUpdatedLogsInArrayLoop();

    var removeLogsLoop = () =>
    {
      updatedLogs.includes(currentLogs[y].getAttribute('id')) == false ? currentLogs[y].remove() : y += 1;

      if(currentLogs[y] != undefined) removeLogsLoop();
    }

    if(currentLogs[y] != undefined) removeLogsLoop();

    var pages = parseInt(updatedLogs.length / 10);
    if(updatedLogs.length % 10 > 0) pages += 1;
    var currentPage = pages;

    var pageSelectors = document.getElementById('pages-container').children;

    var removePageSelectorsLoop = () =>
    {
      pageSelectors[a].remove();

      if(pageSelectors[a += 1] != undefined) removePageSelectorsLoop();
    }

    if(pageSelectors[a] != undefined) removePageSelectorsLoop();

    var addPageSelectorsInContainerLoop = () =>
    {
      if(z > 0)
      {
        if(z < pages)
        {
          var page = document.createElement('div');
          page.setAttribute('tag', z + 1);
          page.innerText = `${z + 1}`;
          page.addEventListener('click', changeFilePage);

          if((z + 1) == 1) page.setAttribute('class', 'page-selected');
          else{ page.setAttribute('class', 'page'); }
          
          document.getElementById('pages-container').appendChild(page);
        }
      }

      else
      {
        var page = document.createElement('div');
        page.setAttribute('tag', z + 1);
        page.innerText = `${z + 1}`;
        page.setAttribute('class', 'page-selected');
        page.addEventListener('click', changeFilePage);
        document.getElementById('pages-container').appendChild(page);
      }

      if((z += 1) < pages) addPageSelectorsInContainerLoop();
    }

    addPageSelectorsInContainerLoop();

    var updateLogsLoop = () =>
    {
      if(document.getElementById(updatedLogs[b]))
      {
        document.getElementById(updatedLogs[b]).setAttribute('tag', currentPage);
        document.getElementById(updatedLogs[b]).children[0].innerText = json.file.logs[b].date;
        document.getElementById(updatedLogs[b]).children[1].innerText = json.file.logs[b].message;
        if(document.getElementById(updatedLogs[b]).children[2]) document.getElementById(updatedLogs[b]).children[2].innerText = json.file.logs[b].comment;

        if(currentPage != 1) document.getElementById(updatedLogs[b]).style.display = 'none';

        if(((updatedLogs.length - 1) - b) % 10 == 0) currentPage -= 1;
      }

      else
      {
        var log = document.createElement('div');

        log.setAttribute('name', 'log');
        log.setAttribute('tag', currentPage);
        
        switch(json.file.logs[b].type)
        {
          case 0: log.setAttribute('class', 'upload-log'); break;
          case 1: log.setAttribute('class', 'download-log'); break;
          case 2: log.setAttribute('class', 'remove-log'); break;
          case 3: log.setAttribute('class', 'comment-log'); break;
        }

        log.setAttribute('id', json.file.logs[b].id);

        var date = document.createElement('div');
        date.setAttribute('class', 'date');
        date.innerText = json.file.logs[b].date;
        log.appendChild(date);

        var content = document.createElement('div');
        content.setAttribute('class', 'content');
        content.innerText = json.file.logs[b].message;
        log.appendChild(content);

        if(json.file.logs[b].type == 3)
        {
          var comment = document.createElement('div');
          comment.setAttribute('class', 'comment');
          comment.innerText = json.file.logs[b].comment;
          log.appendChild(comment);
        }

        if(currentPage != 1) log.style.display = 'none';

        document.getElementById('comments').insertBefore(log, document.getElementById('comments').children[0]);

        if(((updatedLogs.length - 1) - b) % 10 == 0) currentPage -= 1;
      }

      if(updatedLogs[b += 1] != undefined) updateLogsLoop();
    }

    if(updatedLogs[b] != undefined) updateLogsLoop();
  });
}

/****************************************************************************************************/

function uploadFileLogs(logID, pageIndex)
{
  $.ajax(
  {
    type: 'PUT', timeout: 5000, dataType: 'JSON', data: { log: logID }, url: '/file/get-log', success: () => {},
    error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                  
  }).done((json) =>
  {
    var log       = document.createElement('div');
    var date      = document.createElement('div');
    var content   = document.createElement('div');

    switch(json.log.type)
    {
      case 0: $(log).attr({ id: json.log.id, tag: '1', name: 'log', class: 'upload-log' }); break;
      case 1: $(log).attr({ id: json.log.id, tag: '1', name: 'log', class: 'download-log' }); break;
      case 2: $(log).attr({ id: json.log.id, tag: '1', name: 'log', class: 'remove-log' }); break;
      case 3: $(log).attr({ id: json.log.id, tag: '1', name: 'log', class: 'comment-log' }); break;
    }

    $(date)     .attr('class', 'date');
    $(content)  .attr('class', 'content');

    $(date)     .text(json.log.date);
    $(content)  .text(json.log.message);

    $(log)      .hide().prependTo('.comments');

    $(date)     .appendTo(log);
    $(content)  .appendTo(log);

    if(json.log.comment != undefined)
    {
      var comment = document.createElement('div');

      $(comment).attr('class', 'comment');
      $(comment).text(json.log.comment);

      $(comment).appendTo(log);
    }

    var pages = parseInt(document.getElementsByName('log').length / 10);
    if(document.getElementsByName('log').length % 10 > 0) pages += 1;

    if(pages > document.getElementById('pages-container').children.length)
    {
      var page = document.createElement('div');
      page.setAttribute('class', 'page');
      page.setAttribute('tag', pages);
      page.addEventListener('click', changeFilePage);
      page.innerText = pages;
      document.getElementById('pages-container').appendChild(page);
    }

    var x = 0, logsForCurrentPage = 0, currentPage = 1;
    var logs = document.getElementsByName('log');

    var updatePageTagLoop = () =>
    {
      if(logsForCurrentPage == 10)
      {
        logsForCurrentPage = 0;
        currentPage += 1;
      }

      logsForCurrentPage += 1;

      logs[x].setAttribute('tag', currentPage);

      if(pageIndex == 1 && x == 0)
      {
        $(log).fadeIn(500);
      }

      else
      {
        currentPage == pageIndex ? logs[x].removeAttribute('style') : logs[x].style.display = 'none';
      }

      if(logs[x += 1] != undefined) updatePageTagLoop();
    }

    if(logs[x] != undefined) updatePageTagLoop();
  });
}

/****************************************************************************************************/

function changeFilePage(event)
{
  if(event.target.getAttribute('class') == 'page')
  {
    var x  = 0, y = 0, z = 0;
    var logs = document.getElementsByName('log');
    var pageSelectors = document.getElementById('pages-container').children;

    var selectorLoop = () =>
    {
      pageSelectors[z].setAttribute('class', 'page');

      if(pageSelectors[z += 1] != undefined) selectorLoop();
    }

    if(pageSelectors[z] != undefined) selectorLoop();

    event.target.setAttribute('class', 'page-selected');

    var displayLogs = () =>
    {
      logs[x].getAttribute('tag') == event.target.getAttribute('tag') ?
      
      logs[x].removeAttribute('style') :

      logs[x].style.display = 'none';

      if(logs[x += 1] != undefined) displayLogs();
    }

    if(logs[x] != undefined) displayLogs();
  }
}

/****************************************************************************************************/

function updateReportCommentList(reportUUID)
{
  document.getElementById('update-message').setAttribute('class', 'update-pending');
  document.getElementById('update-message').innerHTML = `<i class='update-icon fa fa-refresh fa-spin fa-fw'></i><div class='update-message'>Mise à jour des logs...</div>`;

  $.ajax(
  {
    type: 'PUT', timeout: 5000, dataType: 'JSON', data: { report: reportUUID }, url: '/reports/get-logs', success: () => {},
    error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                      
  }).done((json) =>
  {
    var x = 0, y = 0, currentLogsArray = [], updatedLogsArray = [];
    var logs = document.getElementsByClassName('comment');

    var getCurrentLogsInAnArrayLoop = () =>
    {
      if(logs[x] != undefined) currentLogsArray.push(logs[x].getAttribute('id'));

      logs[x += 1] != undefined ? getCurrentLogsInAnArrayLoop() : getUpdatedLogsInAnArrayLoop();
    }

    var getUpdatedLogsInAnArrayLoop = () =>
    {
      if(json.report.logs[y] != undefined) updatedLogsArray.push(String(json.report.logs[y].id));

      json.report.logs[y += 1] != undefined ? getUpdatedLogsInAnArrayLoop() : updateReportsLogsLoop();
    }

    var updateReportsLogsLoop = () =>
    {
      var z = 0, a = 0;

      var removeLogsLoop = () =>
      {
        if(currentLogsArray[z] != undefined && updatedLogsArray.includes(currentLogsArray[z]) == false) document.getElementById(currentLogsArray[z]).remove();

        currentLogsArray[z += 1] != undefined ? removeLogsLoop() : addLogsLoop();
      }

      var addLogsLoop = () =>
      {
        if(updatedLogsArray[a] != undefined)
        {
          if(currentLogsArray.includes(updatedLogsArray[a]) == false)
          {
            var block = document.createElement('div');
            block.setAttribute('id', updatedLogsArray[a]);
            block.setAttribute('class', `comment log-${json.report.logs[a].type}`);

            var date = document.createElement('div');
            date.setAttribute('class', 'log-date');
            date.innerText = json.report.logs[a].date;

            var label = document.createElement('div');
            label.setAttribute('class', 'log-label');
            label.innerText = json.report.logs[a].label;

            if(json.report.logs[a].type == 1 && json.report.logs[a].comment.admin == 1)
            {
              var star = document.createElement('i');
              star.setAttribute('class', 'fa fa-star admin-star');
              star.setAttribute('aria-hidden', 'true');
              block.appendChild(star);
            }

            block.appendChild(date);
            block.appendChild(label);

            if(json.report.logs[a].type == 1)
            {
              var comment = document.createElement('div');
              comment.setAttribute('name', json.report.logs[a].comment.id);
              comment.setAttribute('class', 'log-message');
              comment.innerText = json.report.logs[a].comment.message;

              block.appendChild(comment);

              var status = document.createElement('div');

              json.report.logs[a].comment.read == 0 ?
              status.setAttribute('name', 'false') : status.setAttribute('name', 'true');

              json.report.logs[a].comment.read == 0 ?
              status.setAttribute('class', 'not-read') : status.setAttribute('class', 'read');

              json.report.logs[a].comment.read == 0 ?
              status.innerHTML = `<i class='fa fa-close' aria-hidden='true'></i>Non-lu` : status.innerHTML = `<i class='fa fa-check' aria-hidden='true'></i>Lu`;

              if(json.report.logs[a].comment.admin == 0) block.appendChild(status);
            }

            document.getElementById('comments-block').insertBefore(block, document.getElementById('comments-block').children[1]);
          }

          else
          {
            if(json.report.logs[a].type == 1 && json.report.logs[a].comment.admin == 0 && json.report.logs[a].comment.read == 1)
            {
              if(document.getElementById(updatedLogsArray[a]).children[3].getAttribute('name') == 'false')
              {
                document.getElementById(updatedLogsArray[a]).children[3].setAttribute('name', 'true');
                document.getElementById(updatedLogsArray[a]).children[3].setAttribute('class', 'read');
                document.getElementById(updatedLogsArray[a]).children[3].innerHTML = `<i class='fa fa-check' aria-hidden='true'></i>Lu`;
              }
            }

            else if(json.report.logs[a].type == 1 && json.report.logs[a].comment.admin == 0 && json.report.logs[a].comment.read == 0)
            {
              if(document.getElementById(updatedLogsArray[a]).children[3].getAttribute('name') == 'true')
              {
                document.getElementById(updatedLogsArray[a]).children[3].setAttribute('name', 'false');
                document.getElementById(updatedLogsArray[a]).children[3].setAttribute('class', 'not-read');
                document.getElementById(updatedLogsArray[a]).children[3].innerHTML = `<i class='fa fa-close' aria-hidden='true'></i>Non-lu`;
              }
            }
          }

          a += 1;

          addLogsLoop();
        }

        else
        {
          setTimeout(() =>
          {
            document.getElementById('update-message').setAttribute('class', 'update-done');
            document.getElementById('update-message').innerHTML = `<i class='update-icon fa fa-check' aria-hidden='true'></i><div class='update-message'>Logs à jour</div>`;
          }, 500);
        }
      }

      removeLogsLoop();
    }

    getCurrentLogsInAnArrayLoop();
  });
}

/****************************************************************************************************/

function updateAdminReportCommentList(reportUUID)
{
  document.getElementById('update-message').setAttribute('class', 'update-pending');
  document.getElementById('update-message').innerHTML = `<i class='update-icon fa fa-refresh fa-spin fa-fw'></i><div class='update-message'>Mise à jour des commentaires...</div>`;

  $.ajax(
  {
    type: 'PUT', timeout: 5000, dataType: 'JSON', data: { report: reportUUID }, url: '/admin/reports/get-comments', success: () => {},
    error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                    
  }).done((json) =>
  {
    var x = 0, y = 0, currentCommentsArray = [], updatedCommentsArray = [];
    var comments = document.getElementsByClassName('comment');

    var getCurrentCommentsInAnArrayLoop = () =>
    {
      if(comments[x] != undefined) currentCommentsArray.push(comments[x].getAttribute('id'));

      comments[x += 1] != undefined ? getCurrentCommentsInAnArrayLoop() : getUpdatedcommentsInAnArrayLoop();
    }

    var getUpdatedcommentsInAnArrayLoop = () =>
    {
      if(json.report.comments[y] != undefined) updatedCommentsArray.push(String(json.report.comments[y].id));

      json.report.comments[y += 1] != undefined ? getUpdatedcommentsInAnArrayLoop() : updateReportsCommentsLoop();
    }

    var updateReportsCommentsLoop = () =>
    {
      var z = 0, a = 0;

      var removeCommentsLoop = () =>
      {
        if(currentCommentsArray[z] != undefined && updatedCommentsArray.includes(currentCommentsArray[z]) == false) document.getElementById(currentCommentsArray[z]).remove();

        currentCommentsArray[z += 1] != undefined ? removeCommentsLoop() : addCommentsLoop();
      }

      var addCommentsLoop = () =>
      {
        if(updatedCommentsArray[a] != undefined)
        {
          if(currentCommentsArray.includes(updatedCommentsArray[a]) == false)
          {
            var block = document.createElement('div');
            block.setAttribute('id', updatedCommentsArray[a]);

            if(json.report.comments[a].admin == 1)
            {
              block.setAttribute('class', `comment admin-comment`);

              var star = document.createElement('i');
              star.setAttribute('class', 'fa fa-star admin-star');
              star.setAttribute('aria-hidden', 'true');
              block.appendChild(star);
            }

            else
            {
              json.report.comments[a].seen == 0 ?
              block.setAttribute('class', `comment not-read-comment`) :
              block.setAttribute('class', `comment read-comment`);

              json.report.comments[a].seen == 0 ?
              block.setAttribute('name', `0`) :
              block.setAttribute('name', `1`);
            }

            var head = document.createElement('div');
            head.setAttribute('class', 'log-head');

            var date = document.createElement('div');
            date.setAttribute('class', 'log-date');
            date.innerText = json.report.comments[a].date;

            var label = document.createElement('div');
            label.setAttribute('class', 'log-label');
            label.innerText = json.report.comments[a].account;

            var button = document.createElement('button');

            json.report.comments[a].seen == 0 ?
            button.setAttribute('class', `log-button log-button-read`) :
            button.setAttribute('class', `log-button log-button-not-read`);

            json.report.comments[a].seen == 0 ?
            button.innerText = 'Marquer comme lu' :
            button.innerText = 'Marquer comme non-lu';

            var message = document.createElement('div');

            json.report.comments[a].admin == 1 ?
            message.setAttribute('class', 'log-message-admin') :
            message.setAttribute('class', 'log-message');

            message.innerText = json.report.comments[a].content;

            head.appendChild(date);
            head.appendChild(label);

            block.appendChild(head);

            if(json.report.comments[a].admin == 0) block.appendChild(button);

            block.appendChild(message);

            document.getElementById('comments-block').insertBefore(block, document.getElementById('comments-block').children[1]);
          }

          else
          {
            if(json.report.comments[a].seen == 1)
            {
              if(document.getElementById(updatedCommentsArray[a]).getAttribute('name') == '0')
              {
                document.getElementById(updatedCommentsArray[a]).setAttribute('name', '1');
                document.getElementById(updatedCommentsArray[a]).setAttribute('class', 'comment admin-comment read-comment');
                document.getElementById(updatedCommentsArray[a]).children[1].setAttribute('class', 'log-button log-button-not-read');
                document.getElementById(updatedCommentsArray[a]).children[1].innerText = 'Marquer comme non-lu';
              }
            }

            else if(json.report.comments[a].seen == 0)
            {
              if(document.getElementById(updatedCommentsArray[a]).getAttribute('name') == '1')
              {
                document.getElementById(updatedCommentsArray[a]).setAttribute('name', '0');
                document.getElementById(updatedCommentsArray[a]).setAttribute('class', 'comment admin-comment not-read-comment');
                document.getElementById(updatedCommentsArray[a]).children[1].setAttribute('class', 'log-button log-button-read');
                document.getElementById(updatedCommentsArray[a]).children[1].innerText = 'Marquer comme lu';
              }
            }
          }

          a += 1;

          addCommentsLoop();
        }

        else
        {
          setTimeout(() =>
          {
            document.getElementById('update-message').setAttribute('class', 'update-done');
            document.getElementById('update-message').innerHTML = `<i class='update-icon fa fa-check' aria-hidden='true'></i><div class='update-message'>Commentaires à jour</div>`;
          }, 500);
        }
      }

      removeCommentsLoop();
    }

    getCurrentCommentsInAnArrayLoop();

    var fourthLoop = () =>
    {
      if(json.report.comments[a] != undefined)
      {
        document.getElementById(json.report.comments[a]['id']).setAttribute('name', json.report.comments[a]['seen']);

        if(json.report.comments[a]['seen'] == 1)
        {
          document.getElementById(json.report.comments[a]['id']).setAttribute('class', 'comment admin-comment read-comment');
          document.getElementById(json.report.comments[a]['id']).children[1].innerHTML = 'Marquer comme non-lu';
          document.getElementById(json.report.comments[a]['id']).children[1].setAttribute('class', 'log-button log-button-not-read');
        }
        
        else
        {
          document.getElementById(json.report.comments[a]['id']).setAttribute('class', 'comment admin-comment not-read-comment');
          document.getElementById(json.report.comments[a]['id']).children[1].innerHTML = 'Marquer comme lu';
          document.getElementById(json.report.comments[a]['id']).children[1].setAttribute('class', 'log-button log-button-read');
        }
      }

      if(json.report.comments[a += 1] != undefined) fourthLoop();
      
      else
      {
        setTimeout(() =>
        {
          document.getElementById('update-message').setAttribute('class', 'update-done');
          document.getElementById('update-message').innerHTML = `<i class='update-icon fa fa-check' aria-hidden='true'></i><div class='update-message'>Commentaires à jour</div>`;
        }, 500);
      }
    }
  });
}

/****************************************************************************************************/

function updateReportsList(pageSelector)
{
  $.ajax(
  {
    type: 'GET', timeout: 5000, dataType: 'JSON', url: '/reports/get-reports-list', success: () => {},
    error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                      
  }).done((json) =>
  {
    document.getElementById('counter').innerText = `Rapports : ${Object.keys(json.reports).length}`;
    var x = 0, y = 0, z = 0, a = 0, b = 0;
    var uploadedReportsArray = [], currentReportsArray = [];
    var currentReports = document.getElementsByName('report');

    var reportsAmount = Object.keys(json.reports).length;
    var pages = 0;

    if(reportsAmount > 0)
    {
      pages = parseInt(Object.keys(json.reports).length / 10);
      reportsAmount = Object.keys(json.reports).length % 10;
      if(reportsAmount > 0) pages += 1;
    }

    var pageIndex = pages;

    if(pageSelector > pages) pageSelector = pages;

    var putUploadedReportsInAnArrayLoop = () =>
    {
      if(json.reports[x] != undefined) uploadedReportsArray.push(json.reports[x]['report_uuid']);

      json.reports[x += 1] != undefined ? putUploadedReportsInAnArrayLoop() : putCurrentReportsInAnArrayLoop();
    }

    var putCurrentReportsInAnArrayLoop = () =>
    {
      if(currentReports[y] != undefined) currentReportsArray.push(currentReports[y].getAttribute('id'));

      currentReports[y += 1] != undefined ? putCurrentReportsInAnArrayLoop() : removeDeletedReportsLoop();
    }

    var removeDeletedReportsLoop = () =>
    {
      if(uploadedReportsArray.includes(currentReportsArray[z]) == false && currentReportsArray[z] != undefined) document.getElementById(currentReportsArray[z]).remove();

      currentReportsArray[z += 1] != undefined ? removeDeletedReportsLoop() : updateReportsLoop();
    }

    var updateReportsLoop = () =>
    {
      if(json.reports[a] != undefined)
      {        
        if(currentReportsArray.includes(json.reports[a]['report_uuid']))
        {
          document.getElementById(json.reports[a]['report_uuid']).setAttribute('tag', pageIndex);
          document.getElementById(json.reports[a]['report_uuid']).children[0].innerHTML = `<div class='fa fa-envelope-o envelope' notifications='${json.reports[a]['unread_comments'] > 99 ? 99 : json.reports[a]['unread_comments']}'></div>`;
          document.getElementById(json.reports[a]['report_uuid']).children[1].innerText = json.types[json.reports[a]['report_type']];
          document.getElementById(json.reports[a]['report_uuid']).children[2].innerText = json.reports[a]['report_date'];
          document.getElementById(json.reports[a]['report_uuid']).children[3].innerText = json.reports[a]['report_subject'];
          document.getElementById(json.reports[a]['report_uuid']).children[4].innerText = json.status[json.reports[a]['report_status']]['name'];
          document.getElementById(json.reports[a]['report_uuid']).children[4].style.color = json.status[json.reports[a]['report_status']]['color'];

          pageIndex != pageSelector ? 
          document.getElementById(json.reports[a]['report_uuid']).style.display = 'none' :
          document.getElementById(json.reports[a]['report_uuid']).removeAttribute('style');

          if((uploadedReportsArray.length - (a + 1)) % 10 == 0) pageIndex -= 1;
        }

        else
        {
          var row = document.createElement('tr');

          row.setAttribute('id', json.reports[a]['report_uuid']);
          row.setAttribute('name', 'report');
          row.setAttribute('class', `report ${json.reports[a]['report_type']} ${json.reports[a]['report_status']}`);
          row.setAttribute('tag', pageIndex);

          var messages = document.createElement('td');
          messages.innerHTML = `<div class='fa fa-envelope-o envelope' notifications='${json.reports[a]['unread_comments'] > 99 ? 99 : json.reports[a]['unread_comments']}'></div>`;

          var type = document.createElement('td');
          type.innerText = json.types[json.reports[a]['report_type']];

          var date = document.createElement('td');
          date.setAttribute('class', 'hide');
          date.innerText = json.reports[a]['report_date'];

          var subject = document.createElement('td');
          subject.innerText = json.reports[a]['report_subject'];

          var status = document.createElement('td');
          status.style.color = json.status[json.reports[a]['report_status']]['color'];
          status.innerText = json.status[json.reports[a]['report_status']]['name'];

          row.appendChild(messages);
          row.appendChild(type);
          row.appendChild(date);
          row.appendChild(subject);
          row.appendChild(status);

          if(pageIndex != pageSelector) row.style.display = 'none';

          document.getElementById('reports-table').insertBefore(row, document.getElementById('reports-table').children[1]);

          if((uploadedReportsArray.length - (a + 1)) % 10 == 0) pageIndex -= 1;
        }

        a += 1;

        updateReportsLoop();
      }

      else
      {
        pagesLoop();
      }
    }

    var pagesLoop = () =>
    {
      if(b < pages)
      {
        if(document.getElementById('pages-container').children[b] == undefined)
        {
          var page = document.createElement('div');
          page.innerText = `${b + 1}`;

          if(pageSelector > pages && (b + 1) == pages) page.setAttribute('class', 'page-selected');
          else if((b + 1) == pageSelector) page.setAttribute('class', 'page-selected');
          else{ page.setAttribute('class', 'page'); }
          
          page.addEventListener('click', changeReportPage);

          page.setAttribute('tag', `${b + 1}`);

          document.getElementById('pages-container').appendChild(page);
        }

        b += 1;

        pagesLoop();
      }

      else
      {
        //UPDATE OVER MESSAGE
      }
    }

    putUploadedReportsInAnArrayLoop();
  });
}

/****************************************************************************************************/

function changeReportPage(event)
{
  if(event.target.getAttribute('class') == 'page')
  {
    var x  = 0, y = 0, z = 0;
    var reportsToDisplay = [];
    var reports = document.getElementsByName('report');
    var pageSelectors = document.getElementById('pages-container').children;

    var selectorLoop = () =>
    {
      pageSelectors[z].setAttribute('class', 'page');

      if(pageSelectors[z += 1] != undefined) selectorLoop();
    }

    if(pageSelectors[z] != undefined) selectorLoop();

    event.target.setAttribute('class', 'page-selected');

    var getReportsToShow = () =>
    {
      if(reports[x].getAttribute('tag') == event.target.getAttribute('tag')) reportsToDisplay.push(reports[x]);

      reports[x].style.display = 'none';

      if(reports[x += 1] != undefined) getReportsToShow();
    }

    if(reports[x] != undefined) getReportsToShow();

    var displayLoop = () =>
    {
      reportsToDisplay[y].removeAttribute('style');

      if(reportsToDisplay[y += 1] != undefined) displayLoop();
    }

    if(reportsToDisplay[y] != undefined) displayLoop();
  }
}

/****************************************************************************************************/

function applyFilterOnReports(filterValue, displayBugs, displayUpgrades)
{
  var x = 0, y = 0, z = 0, a = 0, b = 0;
  var reportsToDisplay = [];
  var reports = document.getElementsByName('report');

  var sortLoop = () =>
  {
    if(reports[x].className.indexOf(filterValue) > -1)
    {
      if(displayBugs == true && reports[x].className.indexOf('bug') > -1)
      {
        reportsToDisplay.push(reports[x]);
      }

      else if(displayUpgrades == true && reports[x].className.indexOf('upgrade') > -1)
      {
        reportsToDisplay.push(reports[x]);
      }
    }

    if(reports[x += 1] != undefined) sortLoop();
  }

  if(reports[x] != undefined) sortLoop();

  var pages = 0;
  var reportsAmount = reportsToDisplay.length;

  pages += parseInt(reportsToDisplay.length / 10);
  reportsAmount = reportsAmount % 10;

  if(reportsAmount > 0) pages += 1;

  var removePageTagForAllReports = () =>
  {
    reports[y].removeAttribute('tag');

    if(reports[y += 1] != undefined) removePageTagForAllReports();
  }

  if(reports[y] != undefined) removePageTagForAllReports();

  var assignPageTagLoop = () =>
  {
    reportsToDisplay[z].setAttribute('tag', String(parseInt(z / 10) + 1));

    if(reportsToDisplay[z += 1] != undefined) assignPageTagLoop();
  }

  if(reportsToDisplay[z] != undefined) assignPageTagLoop();

  var pageSelectorsRemovalLoop = () =>
  {
    document.getElementById('pages-container').children[0].remove();

    if(document.getElementById('pages-container').children[0] != undefined) pageSelectorsRemovalLoop();
  }

  if(document.getElementById('pages-container').children[0] != undefined) pageSelectorsRemovalLoop();

  var pageSelectorsCreationLoop = () =>
  {
    var page = document.createElement('div');

    page.innerText = `${a + 1}`;

    a == 0 ?
    page.setAttribute('class', 'page-selected') : page.setAttribute('class', 'page');
          
    page.addEventListener('click', changeReportPage);

    page.setAttribute('tag', `${a + 1}`);

    document.getElementById('pages-container').appendChild(page);

    if((a += 1) < pages) pageSelectorsCreationLoop();
  }

  if(pages > 0) pageSelectorsCreationLoop();

  var hideReportsOverFirstPageLoop = () =>
  {
    reports[b].hasAttribute('tag') && reports[b].getAttribute('tag') == '1' ? reports[b].removeAttribute('style') : reports[b].style.display = 'none';

    if(reports[b += 1] != undefined) hideReportsOverFirstPageLoop();
  }

  if(reports[b] != undefined) hideReportsOverFirstPageLoop();
}

/****************************************************************************************************/

function displayReportsInAllStatus(displayBugs, displayUpgrades)
{
  var x = 0, y = 0, z = 0, a = 0, b = 0;
  var reportsToDisplay = [];
  var reports = document.getElementsByName('report');

  var sortLoop = () =>
  {
    if(displayBugs == true && reports[x].className.indexOf('bug') > -1)
    {
      reportsToDisplay.push(reports[x]);
    }

    else if(displayUpgrades == true && reports[x].className.indexOf('upgrade') > -1)
    {
      reportsToDisplay.push(reports[x]);
    }

    if(reports[x += 1] != undefined) sortLoop();
  }

  if(reports[x] != undefined) sortLoop();

  var pages = 0;
  var reportsAmount = reportsToDisplay.length;

  pages += parseInt(reportsToDisplay.length / 10);
  reportsAmount = reportsAmount % 10;

  if(reportsAmount > 0) pages += 1;

  var removePageTagForAllReports = () =>
  {
    reports[y].removeAttribute('tag');

    if(reports[y += 1] != undefined) removePageTagForAllReports();
  }

  if(reports[y] != undefined) removePageTagForAllReports();

  var assignPageTagLoop = () =>
  {
    reportsToDisplay[z].setAttribute('tag', String(parseInt(z / 10) + 1));

    if(reportsToDisplay[z += 1] != undefined) assignPageTagLoop();
  }

  if(reportsToDisplay[z] != undefined) assignPageTagLoop();

  var pageSelectorsRemovalLoop = () =>
  {
    document.getElementById('pages-container').children[0].remove();

    if(document.getElementById('pages-container').children[0] != undefined) pageSelectorsRemovalLoop();
  }

  if(document.getElementById('pages-container').children[0] != undefined) pageSelectorsRemovalLoop();

  var pageSelectorsCreationLoop = () =>
  {
    var page = document.createElement('div');

    page.innerText = `${a + 1}`;

    a == 0 ?
    page.setAttribute('class', 'page-selected') : page.setAttribute('class', 'page');
          
    page.addEventListener('click', changeReportPage);

    page.setAttribute('tag', `${a + 1}`);

    document.getElementById('pages-container').appendChild(page);

    if((a += 1) < pages) pageSelectorsCreationLoop();
  }

  if(pages > 0) pageSelectorsCreationLoop();

  var hideReportsOverFirstPageLoop = () =>
  {
    reports[b].hasAttribute('tag') && reports[b].getAttribute('tag') == '1' ? reports[b].removeAttribute('style') : reports[b].style.display = 'none';

    if(reports[b += 1] != undefined) hideReportsOverFirstPageLoop();
  }

  if(reports[b] != undefined) hideReportsOverFirstPageLoop();
}

/****************************************************************************************************/