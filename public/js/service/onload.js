window.onload = $(function()
{
  $.ajax(
  {
    type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: $(document.getElementById('service-main-block')).attr('name') }, url: '/service/get-user-rights', success: function(){},
    error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                  
  }).done(function(json)
  {
    if(json['upload_files'] == 1) $('<button id=\'service-main-block-file-buttons-upload\' class=\'service-main-block-file-buttons-upload\'><i class=\'fa fa-upload service-main-block-file-buttons-upload-icon\' aria-hidden=\'true\'></i>Ajouter</button>').appendTo('#service-main-block');
  
    $('<table id=\'service-main-block-table\' class=\'service-main-block-table\'><tr class=\'service-main-block-table-legend\'><th class=\'service-main-block-file-name\'>Nom du fichier</th><th class=\'service-main-block-file-type\'>Type</th><th class=\'service-main-block-file-account\'>Propriétaire</th><th class=\'service-main-block-file-buttons\'></th></tr></table>').appendTo(document.getElementById('service-main-block'));

    updateFilesList($(document.getElementById('service-main-block')).attr('name'), function(){});
  });
});