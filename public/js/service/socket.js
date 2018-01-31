window.onload = $(() =>
{
  var socket = io();

  socket.on('connect', () =>
  {
    socket.emit('join_service', $(document.getElementById('service-main-block')).attr('name'));
  });
  
  socket.on('upload_file', () =>
  {
    updateFilesList($(document.getElementById('service-main-block')).attr('name'), () => {});
  });

  socket.on('delete_file', (fileUUID) =>
  {
    printError('Un fichier a été supprimé.');

    $(`#${fileUUID}`).find('.service-main-block-buttons').html(`<div name='selected' class='service-main-block-file-deleted'>Supprimé</div>`);

    var files = document.getElementsByName('service-main-block-file');
  
    if(files.length == 0) printMessage('Aucun fichier associé à ce service pour le moment.');
  
    updateFilesList($(document.getElementById('service-main-block')).attr('name'), () => {});
  });
});