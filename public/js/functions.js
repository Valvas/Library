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

  $(cancelButton)       .html(`<i class="fa fa-times fa-fw" aria-hidden="true"></i>`);
  $(sendButton)         .html(`<i class="fa fa-paper-plane fa-fw" aria-hidden="true"></i>`);
  
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
  $(infoMessage)        .appendTo(popup);
  $(sendButton)         .appendTo(popup);
  $(cancelButton)       .appendTo(popup);
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
    var x = 0;

    var loop = (file) =>
    {
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
        x  % 2 == 0 ?
        $(`<tr id='${file['uuid']}' name='service-main-block-file' class='service-main-block-file-odd'><td class='service-main-block-file-name'>${file['name']}</td><td class='service-main-block-file-type'>${file['type']}</td><td class='service-main-block-file-account hide-1x hide-2x hide-3x'>${file['account']}</td><td name='service-main-block-buttons' class='service-main-block-file-buttons hide-1x'></td></tr>`).appendTo(document.getElementById('service-main-block-table')):
        $(`<tr id='${file['uuid']}' name='service-main-block-file' class='service-main-block-file-even'><td class='service-main-block-file-name'>${file['name']}</td><td class='service-main-block-file-type'>${file['type']}</td><td class='service-main-block-file-account hide-1x hide-2x hide-3x'>${file['account']}</td><td name='service-main-block-buttons' class='service-main-block-file-buttons hide-1x'></td></tr>`).appendTo(document.getElementById('service-main-block-table'));
  
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

      Object.keys(json['files'])[x += 1] != undefined ? loop(json['files'][Object.keys(json['files'])[x]]) : callback();
    }

    json['files'].length > 0 ? loop(json['files'][Object.keys(json['files'])[x]]) : printMessage('Aucun fichier associé à ce service pour le moment.');
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

  $(confirm)    .html('<i class="fa fa-send" aria-hidden="true"></i>');
  $(cancel)     .html('<i class="fa fa-close" aria-hidden="true"></i>');

  $(veil)       .appendTo('body');
  $(popup)      .appendTo('body');

  $(input)      .appendTo(popup);
  $(confirm)    .appendTo(popup);
  $(cancel)     .appendTo(popup);
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

  $(confirm)    .html('<i class="fa fa-send" aria-hidden="true"></i>');
  $(cancel)     .html('<i class="fa fa-close" aria-hidden="true"></i>');

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
    }
  }

  loop();
}

/****************************************************************************************************/