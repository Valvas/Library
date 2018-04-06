/****************************************************************************************************/

if(document.getElementById('download')) document.getElementById('download').addEventListener('click', downloadSelection);

/****************************************************************************************************/

function downloadSelection(event)
{
  var files = document.getElementsByClassName('file');

  var filesToDownload = [];

  var x = 0;
  var strings = null;

  var browseFilesToFindThoseSelected = () =>
  {
    if(files[x].children[0].getAttribute('class') == 'checkbox' && files[x].children[0].children[0].checked) filesToDownload.push(files[x].getAttribute('name'));

    if(files[x += 1] != undefined) browseFilesToFindThoseSelected();
  }

  if(files[x] != undefined) browseFilesToFindThoseSelected();

  if(filesToDownload.length > 0)
  {
    document.getElementById('blur').style.filter = 'blur(4px)';

    var background    = document.createElement('div');
    var box           = document.createElement('div');
    var title         = document.createElement('div');
    var content       = document.createElement('div');
    var loading       = document.createElement('div');

    background        .setAttribute('id', 'downloadFileBackground');
    box               .setAttribute('id', 'downloadFileBox');
    content           .setAttribute('id', 'downloadFileContent');

    background        .setAttribute('class', 'background');
    box               .setAttribute('class', 'servicesDownloadFilePopup');
    title             .setAttribute('class', 'title');
    content           .setAttribute('class', 'content');
    loading           .setAttribute('class', 'loading');

    loading           .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

    title             .style.display = 'none';

    content           .appendChild(loading);
    box               .appendChild(title);
    box               .appendChild(content);
    background        .appendChild(box);
    document.body     .appendChild(background);

    background        .style.display = 'block';

    var data  = new FormData();
    var xhr   = new XMLHttpRequest();

    xhr.timeout = 1000;
    xhr.responseType = 'json';

    xhr.open('GET', '/queries/storage/strings', true);

    xhr.send(null);

    xhr.ontimeout = () =>
    {
      loading.remove();

      displayDownloadPopupError('La requête a expiré, veuillez réessayer plus tard', null);
    }

    xhr.onload = () =>
    {
      loading.remove();

      if(xhr.status == 200)
      {
        strings = xhr.response.strings;

        title           .innerText = xhr.response.strings.services.popup.download.title;
        title           .removeAttribute('style');

        var counter                       = document.createElement('div');
        var currentProgressBlock          = document.createElement('div');
        var currentProgressBar            = document.createElement('div');
        var currentProgressLabel          = document.createElement('div');
        var currentProgressBarStatus      = document.createElement('div');
        var currentProgressBarCompleted   = document.createElement('div');
        var totalProgressBlock            = document.createElement('div');
        var totalProgressBar              = document.createElement('div');
        var totalProgressLabel            = document.createElement('div');
        var totalProgressBarStatus        = document.createElement('div');
        var totalProgressBarCompleted     = document.createElement('div');
        var cancel                        = document.createElement('button');

        counter                           .setAttribute('class', 'counter');
        currentProgressBlock              .setAttribute('class', 'progress');
        currentProgressLabel              .setAttribute('class', 'label');
        currentProgressBar                .setAttribute('class', 'bar');
        currentProgressBarStatus          .setAttribute('class', 'status');
        currentProgressBarCompleted       .setAttribute('class', 'completed');
        totalProgressBlock                .setAttribute('class', 'progress');
        totalProgressLabel                .setAttribute('class', 'label');
        totalProgressBar                  .setAttribute('class', 'bar');
        totalProgressBarStatus            .setAttribute('class', 'status');
        totalProgressBarCompleted         .setAttribute('class', 'completed');
        cancel                            .setAttribute('class', 'cancel');

        counter                           .innerText = `${xhr.response.strings.services.popup.download.counter} : 1/${filesToDownload.length}`;
        currentProgressLabel              .innerText = `${xhr.response.strings.services.popup.download.progress.current} :`;
        totalProgressLabel                .innerText = `${xhr.response.strings.services.popup.download.progress.total} :`;
        currentProgressBarStatus          .innerText = '0%';
        totalProgressBarStatus            .innerText = '0%';
        cancel                            .innerText = xhr.response.strings.services.popup.download.cancel;

        cancel.addEventListener('click', () =>
        {
          xhr.abort();
          closeDownloadPopup();
        });

        currentProgressBar                .appendChild(currentProgressBarStatus);
        currentProgressBar                .appendChild(currentProgressBarCompleted);
        currentProgressBlock              .appendChild(currentProgressLabel);
        currentProgressBlock              .appendChild(currentProgressBar);

        totalProgressBar                  .appendChild(totalProgressBarStatus);
        totalProgressBar                  .appendChild(totalProgressBarCompleted);
        totalProgressBlock                .appendChild(totalProgressLabel);
        totalProgressBlock                .appendChild(totalProgressBar);

        content                           .appendChild(counter);
        content                           .appendChild(currentProgressBlock);
        content                           .appendChild(totalProgressBlock);
        content                           .appendChild(cancel);

        var x = 0;

        var downloadFilesLoop = () =>
        {
          xhr   = new XMLHttpRequest();
          data  = new FormData();

          data.append('files', filesToDownload[x]);
          data.append('service', document.getElementById('main').getAttribute('name'));

          currentProgressLabel.innerText = filesToDownload[x] + ' :';

          counter.innerText = `${strings.services.popup.download.counter} : ${x + 1}/${filesToDownload.length}`;

          xhr.responseType = 'blob';

          xhr.open('POST', '/queries/storage/services/download-file', true);

          xhr.send(data);

          xhr.onprogress = (event) =>
          {
            if(event.lengthComputable) 
            {
              var currentProgress             = ((event.loaded / event.total) * 100).toFixed(2);
              var totalProgress               = (((100 / filesToDownload.length) * x) + currentProgress / filesToDownload.length).toFixed(2);

              currentProgressBarStatus        .innerText = currentProgress + '%';
              totalProgressBarStatus          .innerText = totalProgress + '%';

              currentProgressBarCompleted     .style.width = `${parseInt(currentProgress)}%`;
              totalProgressBarCompleted       .style.width = `${parseInt(totalProgress)}%`;
            }

            else 
            {
              currentProgressBarStatus        .innerText = '?';
              totalProgressBarStatus          .innerText = `?`;
            }
          }

          xhr.onload = () =>
          {
            if(xhr.status == 200)
            {
              var file    = xhr.response;
              var link    = document.createElement('a');
              link        .href = window.URL.createObjectURL(file);
              link        .download = filesToDownload[x];
              link        .click();

              if(filesToDownload[x += 1] != undefined) downloadFilesLoop();

              else
              {
                document.getElementById('downloadFileContent').innerHTML = '';

                var message     = document.createElement('div');
                var icon        = document.createElement('div');
                var content     = document.createElement('div');
                var close       = document.createElement('button');

                message         .setAttribute('class', 'message');
                icon            .setAttribute('class', 'icon');
                content         .setAttribute('class', 'content');
                close           .setAttribute('class', 'button');

                icon            .innerHTML = `<i class='far fa-check-circle'></i>`;
                content         .innerText = strings.services.popup.download.done;
                close           .innerText = strings.services.popup.download.close;

                close           .addEventListener('click', closeDownloadPopup);

                message         .appendChild(icon);
                message         .appendChild(content);

                document.getElementById('downloadFileContent').appendChild(message);
                document.getElementById('downloadFileContent').appendChild(close);
              }
            }

            else
            {
              if(xhr.status == 404)
              {
                socket.emit('storageAppServicesFileRemoved', filesToDownload[x], document.getElementById('main').getAttribute('name'));
              }

              reader = new FileReader();

              reader.addEventListener('loadend', (event) => 
              {
                const text = event.srcElement.result;

                const json = JSON.parse(text);

                displayDownloadPopupError(json.message, filesToDownload[x]);
              });
              
              reader.readAsText(xhr.response);
            }
          }
        }

        downloadFilesLoop();
      }

      else
      {
        displayDownloadPopupError(xhr.response.message, xhr.response.detail);
      }
    }
  }
}

/****************************************************************************************************/

function displayDownloadPopupError(message, detail)
{
  document.getElementById('downloadFileContent').style.display = 'none';

  var error     = document.createElement('div');
  var icon      = document.createElement('div');
  var content   = document.createElement('div');
  var button    = document.createElement('button');

  error         .setAttribute('class', 'error');
  icon          .setAttribute('class', 'icon');
  content       .setAttribute('class', 'content');
  button        .setAttribute('class', 'button');

  button        .addEventListener('click', closeDownloadPopup);

  icon          .innerHTML = `<i class='far fa-times-circle'></i>`;
  content       .innerText = message;
  button        .innerText = 'OK';

  error         .appendChild(icon);
  error         .appendChild(content);
  error         .appendChild(button);

  if(detail != null)
  {
    var detailBlock   = document.createElement('div');

    detailBlock       .setAttribute('class', 'detail');
    detailBlock       .innerText = detail;
    error             .appendChild(detailBlock);
  }

  document.getElementById('downloadFileBox').appendChild(error);
}

/****************************************************************************************************/

function closeDownloadPopup(event)
{
  document.getElementById('downloadFileBackground').remove();
  document.getElementById('blur').removeAttribute('style');
}

/****************************************************************************************************/