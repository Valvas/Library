/* 

function createConfirmationPopup(object, name) : 
  object  -> { title: string | undefined, message: string | undefined, info: string | undefined, perform: string | undefined, cancel: string | undefined }
  name    -> string | undefined

function openUploadFilePopup(object, ext) : 
  object  -> { title: string | undefined, message: string | undefined, perform: string | undefined }
  ext     -> [ string, string ]

*/

function createConfirmationPopup(object, name)
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
  $(popup)      .attr({ id: 'popup',                    class: 'popup'});
  $(cancel)     .attr({ id: 'popup-cancel-button',      class: 'popup-cancel-button'});
  $(message)    .attr({ id: 'popup-message',            class: 'popup-message'});
  $(perform)    .attr({ id: 'popup-perform-button',     class: 'popup-perform-button'});

  if(name != undefined) $(popup).attr('name', name);

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