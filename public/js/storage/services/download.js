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
    var background = document.createElement('div');
    background.setAttribute('class', 'background');

    document.getElementById('blur').style.filter = 'blur(4px)';

    var popup         = document.createElement('div');
    var title         = document.createElement('div');
    var loader        = document.createElement('div');
    var message       = document.createElement('div');

    popup             .setAttribute('class', 'popup services upload');
    title             .setAttribute('class', 'title');
    loader            .setAttribute('class', 'loader');

    title             .innerText = 'Réception des données en cours...';
    loader            .innerHTML = `<div class='left'><i class='fas fa-circle-notch fa-spin fa-2x'></i></div><div class='right'>L'attente dépend de la taille des fichiers à récupérer</div>`;

    popup             .appendChild(title);
    popup             .appendChild(loader);

    background        .appendChild(popup);
    document.body     .appendChild(background);

    loader            .style.display = 'block';
    background        .style.display = 'block';

    var progressBar     = document.createElement('div');
    var loadedPart      = document.createElement('div');
    var statusMessage   = document.createElement('div');
    var cancelButton    = document.createElement('button');

    function onProgress(event)
    {
      if(document.body.contains(loader))
      {
        loader.remove();

        progressBar         .setAttribute('class', 'bar');
        loadedPart          .setAttribute('class', 'progress');
        statusMessage       .setAttribute('class', 'status');
        cancelButton        .setAttribute('class', 'cancel');

        cancelButton        .innerText = 'Annuler';

        progressBar         .appendChild(loadedPart);
        progressBar         .appendChild(statusMessage);
        popup               .appendChild(progressBar);
        popup               .appendChild(cancelButton);
      }

      if(event.lengthComputable) 
      {
        var percentComplete = ((event.loaded / event.total) * 100).toFixed(2);

        statusMessage.innerText = `Récupération ${percentComplete}%`;

        loadedPart.style.width = `${percentComplete}%`;
      }

      else 
      {
        statusMessage.innerText = `Impossible de calculer la taille`;
      }
    }

    var data = new FormData();
    var xhr = new XMLHttpRequest();

    cancelButton.addEventListener('click', (event) => 
    { 
      xhr.abort();
      
      background.remove();
      document.getElementById('blur').removeAttribute('style');
    });

    data.append('files', filesToDownload);
    data.append('service', document.getElementById('main').getAttribute('name'));

    xhr.open('POST', '/queries/storage/services/download-files', true);

    xhr.responseType = 'blob';

    xhr.onreadystatechange = () => 
    {
      if(xhr.readyState == xhr.DONE)
      {
        background.remove();
        document.getElementById('blur').removeAttribute('style');

        if(xhr.status == 404 || xhr.status == 406 || xhr.status == 500)
        {
          var reader = new FileReader();
          reader.onload = () => { console.log(reader.result); }
          reader.readAsText(xhr.response);
        }

        else
        {
          var data = xhr.response;
          var a = document.createElement('a');
          a.href = window.URL.createObjectURL(data);
          a.download = '';
          a.click();
        }
      }
    }

    xhr.onprogress = onProgress;

    xhr.send(data);
  }
}

/****************************************************************************************************/