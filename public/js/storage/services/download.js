/****************************************************************************************************/

if(document.getElementById('download')) document.getElementById('download').addEventListener('click', downloadSelection);

/****************************************************************************************************/

function downloadSelection(event)
{
  var files = document.getElementsByClassName('file');

  var filesToDownload = [];

  for(var i = 0; i < files.length; i++)
  {
    if(files[i].children[0].children[0].checked) filesToDownload.push(files[i].getAttribute('name'));
  }

  if(filesToDownload.length > 0)
  {
    var data = new FormData();
    var xhr = new XMLHttpRequest();

    data.append('files', filesToDownload);
    data.append('service', document.getElementById('main').getAttribute('name'));

    xhr.open('POST', '/queries/storage/services/download-files', true);

    xhr.responseType = 'blob';

    xhr.onreadystatechange = () => 
    {
      if(xhr.readyState == xhr.DONE)
      {
        console.log(xhr.response);
      }
    }

    xhr.send(data);
  }
}

/****************************************************************************************************/