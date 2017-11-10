window.onload = $(function()
{
  $.ajax(
  {
    type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: $(document.getElementById('service-main-block')).attr('name')}, url: '/service/get-files-list', success: function(){},
    error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
              
  }).done(function(json)
  {
    if(json['rights']['upload_files'] == 1) $('<button id=\'service-main-block-file-buttons-upload\' class=\'service-main-block-file-buttons-upload\'><i class=\'fa fa-upload service-main-block-file-buttons-upload-icon\' aria-hidden=\'true\'></i>Ajouter</button>').appendTo('#service-main-block');
    
    $('<table id=\'service-main-block-table\' class=\'service-main-block-table\'><tr class=\'service-main-block-table-legend\'><th class=\'service-main-block-file-name\'>Nom du fichier</th><th class=\'service-main-block-file-type\'>Type</th><th class=\'service-main-block-file-account\'>Propriétaire</th><th class=\'service-main-block-file-buttons\'></th></tr></table>').appendTo(document.getElementById('service-main-block'));

    var x = 0;

    var loop = function(file)
    {        
      x % 2 == 0 ?
      $(`<tr id='${file['tag']}' name='service-main-block-file' class='service-main-block-file-even'><td class='service-main-block-file-name'>${file['name']}</td><td class='service-main-block-file-type'>${file['type']}</td><td class='service-main-block-file-account'>${file['account']}</td><td name='service-main-block-buttons' class='service-main-block-file-buttons'></td></tr>`).appendTo(document.getElementById('service-main-block-table')):
      $(`<tr id='${file['tag']}' name='service-main-block-file' class='service-main-block-file-odd'><td class='service-main-block-file-name'>${file['name']}</td><td class='service-main-block-file-type'>${file['type']}</td><td class='service-main-block-file-account'>${file['account']}</td><td name='service-main-block-buttons' class='service-main-block-file-buttons'></td></tr>`).appendTo(document.getElementById('service-main-block-table'));
        
      x++;

      if(Object.keys(json['files'])[x] != undefined) loop(json['files'][Object.keys(json['files'])[x]]);
    }

    json['files'].length > 0 ? loop(json['files'][Object.keys(json['files'])[x]]) : printMessage('Aucun fichier associé à ce service pour le moment.');

    if(json['rights']['download_files'] == 1) $('<i name="service-main-block-buttons-download" class="fa fa-download service-main-block-file-buttons-download" aria-hidden="true"></i>').appendTo('[name="service-main-block-buttons"]');
    if(json['rights']['remove_files'] == 1) $('<i name="service-main-block-buttons-delete" class="fa fa-trash service-main-block-file-buttons-delete" aria-hidden="true"></i>').appendTo('[name="service-main-block-buttons"]');
  });
});