window.onload = $(function()
{
  var socket = io('/service');
  
  socket.on('connect', function() 
  {
    socket.emit('join_service', $(document.getElementById('service-main-block')).attr('name'));
  });
  
  socket.on('new_file', function()
  {
    updateFilesList($(document.getElementById('service-main-block')).attr('name'), function(){});
  });

  socket.on('delete_file', function(fileUUID)
  {
    printSuccess('Un fichier a été supprimé.');

    $(document.getElementById(fileUUID)).fadeOut(1000, function() 
    { 
      $(document.getElementById(fileUUID)).remove();

      var files = document.getElementsByName('service-main-block-file');

      if(files.length == 0) printMessage('Aucun fichier associé à ce service pour le moment.');

      var i = 0;

      var loop = function()
      {
        i % 2 == 0 ? $(files[i]).attr('class', 'service-main-block-file-odd') : $(files[i]).attr('class', 'service-main-block-file-even');

        i++;

        i < files.length ? loop() : updateFilesList($(document.getElementById('service-main-block')).attr('name'), function(){});
      }

      loop();
    });
  });
});