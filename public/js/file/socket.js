window.onload = $(() =>
{
  var socket = io('/file');
  
  socket.on('connect', () =>
  {
    socket.emit('join_file', $('.file-main-block').attr('id'));
  });
  
  socket.on('post_comment', (logID) =>
  {
    uploadFileLogs(logID);
  });

  socket.on('delete_file', (logID) =>
  {
    uploadFileLogs(logID);
  });

  socket.on('download_file', () =>
  {
    printMessage(`Fichier téléchargé`);
  });
});