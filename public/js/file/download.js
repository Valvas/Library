window.onload = $(() =>
{
  var socket = io();

  /****************************************************************************************************/

  $('body').on('click', '.file-main-block .actions button.download', (event) =>
  {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/service/download-file/${$('.file-main-block').attr('name')}/${$('.file-main-block').attr('id')}`, true);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = () => 
    {
      if(xhr.readyState == xhr.DONE)
      {
        socket.emit('from_file_download', { room: $('.file-main-block').attr('id'), logID: xhr.getResponseHeader('logID') });

        var data = xhr.response;
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(data);
        a.download = $('#file-name').attr('name');
        a.click();
      }
    }
    xhr.send();
  });

  /****************************************************************************************************/
});