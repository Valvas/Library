window.onload = $(function()
{
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
    }, $(event.target).parent().parent().attr('id'));
  });

  /****************************************************************************************************/

  $('body').on('click', '#popup-cancel-button', function(event)
  {
    if(document.getElementById('popup')) $(document.getElementById('popup')).remove();
    if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
  });

  /****************************************************************************************************/

  $('body').on('click', '#popup-perform-button', function(event)
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
      if(json['file_deleted_from_database'] == true) 
      {
        printSuccess('Fichier supprimé.');

        $(document.getElementById($(event.target).parent().attr('name'))).fadeOut(1000, function() 
        { 
          $(document.getElementById($(event.target).parent().attr('name'))).remove();

          var files = document.getElementsByName('service-main-block-file');

          if(files.length == 0) printMessage('Aucun fichier associé à ce service pour le moment.');

          for(var i = 0; i < files.length; i++)
          {
            i % 2 == 0 ? $(files[i]).attr('class', 'service-main-block-file-even') : $(files[i]).attr('class', 'service-main-block-file-odd');
          }
        });
      }

      else
      {
        printError('Une erreur est survenue. Fichier non supprimé. Veuillez réessayer ultérieurement.')
      }

      if(document.getElementById('popup')) $(document.getElementById('popup')).remove();
      if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
    });
  });

  /****************************************************************************************************/
});