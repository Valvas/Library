window.onload = $(() =>
{
  var socket = io();

  /****************************************************************************************************/

  $('body').on('click', '.file-main-block .actions button.delete', (event) =>
  {
    createConfirmationPopup(
    {
      title: 'SUPPRIMER UN FICHIER',
      message: 'Êtes-vous sûr(e) ?',
      info: '(la suppression est définitive)',
      perform: 'Oui',
      cancel: 'Non'
    }, 'delete-file-popup', $('.file-main-block').attr('id'));
  });

  /****************************************************************************************************/

  $('body').on('click', '#popup-cancel-button', (event) =>
  {
    if($(event.target).parent().attr('id') == 'delete-file-popup')
    {
      if(document.getElementById('delete-file-popup')) $(document.getElementById('delete-file-popup')).remove();
      if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
    }
  });

  /****************************************************************************************************/

  $('body').on('click', '#popup-perform-button', (event) =>
  {
    if($(event.target).parent().attr('id') == 'delete-file-popup')
    {
      $('#popup-cancel-button').hide();
      $('#popup-perform-button').hide();
  
      $('#popup').append(`<i class='fa fa-spinner fa-pulse fa-2x fa-fw'></i><span class='sr-only'>En cours...</span>`)
  
      $.ajax(
      {
        type: 'DELETE', timeout: 2000, dataType: 'JSON', data: { file: $('.file-main-block').attr('id'), service: $('.file-main-block').attr('name') }, url: '/service/delete-file', success: () => {},
        error: (xhr, status, error) => { printError(JSON.parse(xhr.responseText).message); }
                    
      }).done((json) =>
      {
        $('#delete-file-popup').remove();
        $('#veil').remove();

        socket.emit('from_file_delete', { room: $('.file-main-block').attr('id'), logID: json.log });
        socket.emit('from_service_delete', { room: $('.file-main-block').attr('name'), fileUUID: $('.file-main-block').attr('id') });
      });
    }
  });

  /****************************************************************************************************/
});