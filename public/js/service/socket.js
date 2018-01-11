window.onload = $(() =>
{
  var socket = io('/service');
  
  socket.on('connect', () =>
  {
    socket.emit('join_service', $(document.getElementById('service-main-block')).attr('name'));
  });
  
  socket.on('new_file', () =>
  {
    printMessage('Un fichier a été ajouté.');
    updateFilesList($(document.getElementById('service-main-block')).attr('name'), () => {});
  });

  socket.on('delete_file', (fileUUID) =>
  {
    printSuccess('Un fichier a été supprimé.');

    var files = document.getElementsByName('service-main-block-file');
  
    if(files.length == 0) printMessage('Aucun fichier associé à ce service pour le moment.');
  
    var i = 0;
  
    var loop = () =>
    {
      i % 2 == 0 ? $(files[i]).attr('class', 'service-main-block-file-odd') : $(files[i]).attr('class', 'service-main-block-file-even');
  
      i++;
  
      i < files.length ? loop() : updateFilesList($(document.getElementById('service-main-block')).attr('name'), () => {});
    }
  
    loop();
  });
});