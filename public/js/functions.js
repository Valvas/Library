/* 

function createConfirmationPopup(object) : 
  object  -> { title: string | undefined, message: string | undefined, info: string | undefined, perform: string | undefined, cancel: string | undefined }
  name    -> string | undefined

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

  $(errorMessage).attr('class', 'error-popup');
  $(errorMessage).attr('id', 'error-popup');

  $(errorMessage).text(message);

  $(errorMessage).hide().appendTo('body');

  $(errorMessage).slideDown(0, function()
  {
    var popup = this;

    setTimeout(function(){ $(popup).slideUp(500); setTimeout(function(){ $(popup).remove(); }, 500); }, 5000);
  });
}

/****************************************************************************************************/