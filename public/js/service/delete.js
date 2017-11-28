window.onload = $(function()
{
  var socket = io('/service');

  /****************************************************************************************************/

  $('body').on('click', '[name="service-main-block-buttons-delete"]', function(event)
  {
    createConfirmationPopup(
    {
      title: 'SUPPRIMER UN FICHIER',
      message: 'Êtes-vous sûr(e) ?',
      info: '(la suppression est définitive)',
      perform: 'Oui',
      cancel: 'Non'
    }, 'delete-file-popup', $(event.target).parent().parent().attr('id'));
  });

  /****************************************************************************************************/

  $('body').on('click', '#popup-cancel-button', function(event)
  {
    if($(event.target).parent().attr('id') == 'delete-file-popup')
    {
      if(document.getElementById('delete-file-popup')) $(document.getElementById('delete-file-popup')).remove();
      if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
    }
  });

  /****************************************************************************************************/

  $('body').on('click', '#popup-perform-button', function(event)
  {
    if($(event.target).parent().attr('id') == 'delete-file-popup')
    {
      $('#popup-cancel-button').hide();
      $('#popup-perform-button').hide();
  
      $('#popup').append(`<i class='fa fa-spinner fa-pulse fa-2x fa-fw'></i><span class='sr-only'>En cours...</span>`)
  
      $.ajax(
      {
        type: 'DELETE', timeout: 2000, dataType: 'JSON', data: { file: $(event.target).parent().attr('name'), service: $(document.getElementById('service-main-block')).attr('name')}, url: '/service/delete-file', success: function(){},
        error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                    
      }).done(function(json)
      {
        if(json['result'] == true) 
        {
          socket.emit('delete_file', { room: $(document.getElementById('service-main-block')).attr('name'), fileUUID: $(event.target).parent().attr('name') });
        }
  
        else
        {
          printError('Une erreur est survenue. Fichier non supprimé. Veuillez réessayer ultérieurement.')
        }
  
        if(document.getElementById('delete-file-popup')) $(document.getElementById('delete-file-popup')).remove();
        if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
      });
    }
  });

  /****************************************************************************************************/
});