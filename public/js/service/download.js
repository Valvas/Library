window.onload = $(() =>
{
  var socket = io();
  
  $('body').on('click', '[name="service-main-block-buttons-download"]', (event) =>
  {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', `/service/download-file/${$('#service-main-block').attr('name')}/${$(event.target).parent().parent().attr('id')}`, true);
    xhr.responseType = 'blob';
    xhr.onreadystatechange = () => 
    {
      if(xhr.readyState == xhr.DONE)
      {
        socket.emit('from_file_download', { room: $(event.target).parent().parent().attr('id'), logID: xhr.getResponseHeader('logID') });

        var data = xhr.response;
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(data);
        a.download = $(event.target).parent().parent().attr('tag');
        a.click();
      }
    }
    xhr.send();
  });
});