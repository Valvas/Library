window.onload = $(() =>
{
  var socket = io('/file');

  /****************************************************************************************************/

  $('body').on('click', '.file-main-block .actions button.download', (event) =>
  {
    socket.emit('download_file', { room: $('.file-main-block').attr('id') });
    
    location = `/service/download-file/${$('.file-main-block').attr('name')}/${$('.file-main-block').attr('id')}`;
  });

  /****************************************************************************************************/
});