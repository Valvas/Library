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
    $.ajax(
    {
      type: 'DELETE', timeout: 2000, dataType: 'JSON', data: { file: $(event.target).parent().attr('name'), service: $(document.getElementById('service-main-block')).attr('name')}, url: '/service/delete-file', success: function(){},
      error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                  
    }).done(function(json)
    {
      if(json['is_in_database'] == undefined) printError('500 - INTERNAL SERVER ERROR - FILE NOT DELETED');
      else if(json['is_in_database'] == false) printError('Le fichier est introuvable (il a peut-être déjà été supprimé).');
      else if(json['is_part_of_service'] == undefined) printError('500 - INTERNAL SERVER ERROR - FILE NOT DELETED');
      else if(json['is_part_of_service'] == false) printError('Ce fichier n\'est pas affecté au service actuel.');
      else if(json['can_delete_files'] == undefined) printError('500 - INTERNAL SERVER ERROR - FILE NOT DELETED');
      else if(json['can_delete_files'] == false) printError('Vous n\'avez pas le droit de supprimer ce fichier.');
      else if(json['file_deleted_from_hardware'] == undefined) printError('500 - INTERNAL SERVER ERROR - FILE NOT DELETED');
      else if(json['file_deleted_from_hardware'] == false) printError('Le fichier n\'a pas pu être supprimé. Veuillez réessayer ultérieurement.');
      else if(json['file_deleted_from_database'] == undefined) printError('500 - INTERNAL SERVER ERROR - (Le fichier a bien été supprimé sur le disque mais va continuer à apparaître dans la liste).');
      else if(json['file_deleted_from_database'] == false) printError('500 - INTERNAL SERVER ERROR - (Le fichier a bien été supprimé sur le disque mais va continuer à apparaître dans la liste).');
      
      if(document.getElementById('popup')) $(document.getElementById('popup')).remove();
      if(document.getElementById('veil')) $(document.getElementById('veil')).remove();

      $(document.getElementById($(event.target).parent().attr('name'))).remove();
    });
  });

  /****************************************************************************************************/
});