/* 

function createConfirmationPopup(object, name) : 
  object  -> { title: string, message: string, info: string, perform: string, cancel: string }
  popupID -> @NonNull string
  name    -> string

function openUploadFilePopup(object, ext) : 
  object  -> { title: string, message: string, perform: string }
  ext     -> [ string, string ]

*/

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

  if(ext.length > 0) ext = ext.map(i => '.' + i )

  ext.length == 0 ?
  $(input)      .attr({ id: 'upload-popup-input',           class: 'popup-file-input',      type: 'file',     name: 'file',     accept: '*' }) :
  $(input)      .attr({ id: 'upload-popup-input',           class: 'popup-file-input',      type: 'file',     name: 'file',     accept: `${ext.join()}` });

  ext.length == 0 ?
  $(info)       .text('(Extensions acceptées: toutes)') :
  $(info)       .text(`(Extensions acceptées: ${ext.join()})`);

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
    type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: service }, url: '/service/get-files-list', success: function(){},
    error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                
  }).done(function(json)
  {        
    var x = 0;
  
    var loop = function(file)
    {
      if(!document.getElementById(file['tag']))
      {
        x  % 2 == 0 ?
        $(`<tr id='${file['tag']}' name='service-main-block-file' class='service-main-block-file-even'><td class='service-main-block-file-name'>${file['name']}</td><td class='service-main-block-file-type'>${file['type']}</td><td class='service-main-block-file-account'>${file['account']}</td><td name='service-main-block-buttons' class='service-main-block-file-buttons'></td></tr>`).appendTo(document.getElementById('service-main-block-table')):
        $(`<tr id='${file['tag']}' name='service-main-block-file' class='service-main-block-file-odd'><td class='service-main-block-file-name'>${file['name']}</td><td class='service-main-block-file-type'>${file['type']}</td><td class='service-main-block-file-account'>${file['account']}</td><td name='service-main-block-buttons' class='service-main-block-file-buttons'></td></tr>`).appendTo(document.getElementById('service-main-block-table'));

        if(json['rights']['download_files'] == 1) $('<i name="service-main-block-buttons-download" class="fa fa-download service-main-block-file-buttons-download" aria-hidden="true"></i>').appendTo($(document.getElementById(file['tag'])).find('[name="service-main-block-buttons"]'));
        if(json['rights']['remove_files'] == 1) $('<i name="service-main-block-buttons-delete" class="fa fa-trash service-main-block-file-buttons-delete" aria-hidden="true"></i>').appendTo($(document.getElementById(file['tag'])).find('[name="service-main-block-buttons"]'));
      }

      x++;
  
      if(Object.keys(json['files'])[x] != undefined) loop(json['files'][Object.keys(json['files'])[x]]);
    }
  
    json['files'].length > 0 ? loop(json['files'][Object.keys(json['files'])[x]]) : printMessage('Aucun fichier associé à ce service pour le moment.');

    callback();
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