/****************************************************************************************************/

if(document.getElementById('upload')) document.getElementById('upload').addEventListener('click', openUploadPopup);
if(document.getElementById('upload-popup-close')) document.getElementById('upload-popup-close').addEventListener('click', closeUploadPopup);
if(document.getElementById('file-input')) document.getElementById('file-input').addEventListener('change', changeLabelValue);
if(document.getElementById('upload-popup-send')) document.getElementById('upload-popup-send').addEventListener('click', checkBeforeUpload);

/****************************************************************************************************/

function openUploadPopup(event)
{
  if(document.getElementById('background').getAttribute('tag') == 'off')
  {
    document.getElementById('file-input').value = null;
    document.getElementById('file-input-label').innerText = 'Cliquez ici';
    document.getElementById('blur').style.filter = 'blur(4px)';
    document.getElementById('background').style.display = 'block';
    document.getElementById('background').setAttribute('tag', 'on');
    document.getElementById('upload-popup-loader').style.display = 'block';

    $.ajax(
    {
      type: 'POST', timeout: 5000, dataType: 'JSON', data: { service: document.getElementById('main').getAttribute('name') }, url: '/queries/storage/services/get-upload-ext', success: () => {},
      error: (xhr, status, error) => 
      {
        document.getElementById('upload-popup-loader').removeAttribute('style');
        document.getElementById('upload-popup-close').style.display = 'block';

        if(status == 'timeout') document.getElementById('upload-popup-timeout').style.display = 'block';

        else
        {
          document.getElementById('upload-popup-error').children[1].innerText = xhr.responseJSON.message;
          document.getElementById('upload-popup-error').style.display = 'block';
        }
      }
                  
    }).done((json) =>
    {
      document.getElementById('upload-popup-content-ext-list').innerText = Object.values(json.ext);
      document.getElementById('upload-popup-loader').removeAttribute('style');
      document.getElementById('upload-popup-content').style.display = 'block';
      document.getElementById('upload-popup-close').style.display = 'block';
    });
  }
}

/****************************************************************************************************/

function closeUploadPopup(event)
{
  document.getElementById('blur')                   .removeAttribute('style');
  document.getElementById('background')             .removeAttribute('style');
  document.getElementById('upload-popup-error')     .removeAttribute('style');
  document.getElementById('upload-popup-close')     .removeAttribute('style');
  document.getElementById('upload-popup-content')   .removeAttribute('style');
  document.getElementById('upload-popup-timeout')   .removeAttribute('style');

  if(document.getElementById('upload-popup-success')) document.getElementById('upload-popup-success').remove();

  document.getElementById('background')             .setAttribute('tag', 'off');
}

/****************************************************************************************************/

function changeLabelValue(event)
{
  document.getElementById('file-input-label').innerText = event.target.value.split('\\')[event.target.value.split('\\').length - 1];
}

/****************************************************************************************************/

function checkBeforeUpload(event)
{
  document.getElementById('file-input-label').removeAttribute('style');
  document.getElementById('upload-popup-error').removeAttribute('style');

  if(document.getElementById('file-input').value.length == 0)
  {
    document.getElementById('file-input-label').style.borderTop = '1px solid #FF0F0F';
    document.getElementById('file-input-label').style.borderBottom = '1px solid #FF0F0F';
  }

  else
  {
    $.ajax(
    {
      type: 'POST', timeout: 5000, dataType: 'JSON', data: { service: document.getElementById('main').getAttribute('name') }, url: '/queries/storage/services/get-upload-ext', success: () => {},
      error: (xhr, status, error) => 
      {
        document.getElementById('upload-popup-content').removeAttribute('style');
  
        if(status == 'timeout') document.getElementById('upload-popup-timeout').style.display = 'block';
  
        else
        {
          document.getElementById('upload-popup-error').children[1].innerText = xhr.responseJSON.message;
          document.getElementById('upload-popup-error').style.display = 'block';
        }
      }
                  
    }).done((json) =>
    {
      if(Object.values(json.ext).includes(document.getElementById('file-input').value.split('.')[1]) == false)
      {
        document.getElementById('upload-popup-error').children[1].innerText = 'Format non-autorisé';
        document.getElementById('upload-popup-error').style.display = 'block';

        document.getElementById('file-input-label').style.borderTop = '1px solid #FF0F0F';
        document.getElementById('file-input-label').style.borderBottom = '1px solid #FF0F0F';
      }
  
      else
      {
        document.getElementById('upload-popup-content').style.display = 'none';
        document.getElementById('upload-popup-close').removeAttribute('style');

        var loader          = document.createElement('div');
        loader              .setAttribute('class', 'loader');
        loader              .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;
        document            .getElementById('upload-popup').appendChild(loader);

        $.ajax(
        {
          type: 'POST', timeout: 5000, dataType: 'JSON', data: { file: document.getElementById('file-input').value.split('\\')[document.getElementById('file-input').value.split('\\').length - 1], service: document.getElementById('main').getAttribute('name'), size: document.getElementById('file-input').files[0].size }, url: '/queries/storage/services/check-if-file-exists-before-upload', success: () => {},
          error: (xhr, status, error) => 
          {
            loader.remove();
      
            if(status == 'timeout') document.getElementById('upload-popup-timeout').style.display = 'block';
      
            else
            {
              document.getElementById('upload-popup-error').children[1].innerText = xhr.responseJSON.message;
              document.getElementById('upload-popup-error').style.display = 'block';
            }

            document.getElementById('upload-popup-close').style.display = 'block';
          }
                      
        }).done((json) =>
        {
          loader.remove();

          if(json.rightToReplace == true)
          {
            document.getElementById('upload-popup-error').children[1].innerText = `Ce fichier existe déjà, voulez-vous le remplacer ?`;
            document.getElementById('upload-popup-error').style.display = 'block';

            var noButton        = document.createElement('button');
            var yesButton       = document.createElement('button');

            noButton            .setAttribute('id', 'upload-popup-no');
            yesButton           .setAttribute('id', 'upload-popup-yes');

            noButton            .setAttribute('class', 'no');
            yesButton           .setAttribute('class', 'yes');

            noButton            .innerText = 'Non';
            yesButton           .innerText = 'Oui';

            noButton            .addEventListener('click', clickOnReplaceNo);
            yesButton           .addEventListener('click', clickOnReplaceYes);

            document.getElementById('upload-popup').appendChild(yesButton);
            document.getElementById('upload-popup').appendChild(noButton);
          }

          else
          {
            document.getElementById('upload-popup-error').children[1].innerText = `Ce fichier existe déjà, vous n'avez pas les droits pour le remplacer`;
            document.getElementById('upload-popup-error').style.display = 'block';
            document.getElementById('upload-popup-close').style.display = 'block';
          }
        });
      }
    });
  }
}

/****************************************************************************************************/

function uploadFile()
{
  var data = new FormData();

  data.append('service', document.getElementById('main').getAttribute('name'));
  data.append('file', document.getElementById('file-input').files[0]);

  var progressBar     = document.createElement('div');
  var loadedPart      = document.createElement('div');
  var statusMessage   = document.createElement('div');
  var cancelButton    = document.createElement('button');

  progressBar         .setAttribute('class', 'bar');
  loadedPart          .setAttribute('class', 'progress');
  statusMessage       .setAttribute('class', 'status');
  cancelButton        .setAttribute('class', 'cancel');

  cancelButton        .innerText = 'Annuler';

  progressBar.appendChild(loadedPart);
  progressBar.appendChild(statusMessage);
  document.getElementById('upload-popup').appendChild(progressBar);
  document.getElementById('upload-popup').appendChild(cancelButton);

  var xhr = new XMLHttpRequest();

  cancelButton.addEventListener('click', (event) => 
  { 
    xhr.abort();
    progressBar.remove();
    cancelButton.remove();
    document.getElementById('upload-popup-content').removeAttribute('style');
    document.getElementById('upload-popup-close').style.display = 'block';
  });

  xhr.upload.addEventListener('progress', (event) => 
  {
    if(event.lengthComputable) 
    {
      var percentComplete = ((event.loaded / event.total) * 100).toFixed(2);

      statusMessage.innerText = `Envoi ${percentComplete}%`;

      loadedPart.style.width = `${percentComplete}%`;
    }

    else 
    {
      statusMessage.innerText = `Impossible de calculer la taille`;
    }
  }, false);

  function onload(event)
  {
    if(this.status == 200)
    {
      progressBar.remove();
      cancelButton.remove();
      var success = document.createElement('div');
      success.setAttribute('class', 'success');
      success.setAttribute('id', 'upload-popup-success');
      success.innerHTML = `<div class='left'><i class='far fa-check-circle fa-2x'></i></div><div class='right'>Fichier envoyé avec succès</div>`;
      document.getElementById('upload-popup').insertBefore(success, document.getElementById('upload-popup-close'));
      document.getElementById('upload-popup-close').style.display = 'block';
    }

    else
    {
      progressBar.remove();
      cancelButton.remove();
      document.getElementById('upload-popup-error').children[1].innerText = JSON.parse(this.responseText).message;
      document.getElementById('upload-popup-error').style.display = 'block';
      document.getElementById('upload-popup-close').style.display = 'block';
    }
  }

  xhr.onload = onload;
  xhr.open('POST', '/queries/storage/services/upload-file', true);
  xhr.send(data);
}

/****************************************************************************************************/

function clickOnReplaceYes(event)
{
  document.getElementById('upload-popup-no').remove();
  document.getElementById('upload-popup-yes').remove();
  document.getElementById('upload-popup-error').removeAttribute('style');

  uploadFile();
}

/****************************************************************************************************/

function clickOnReplaceNo(event)
{
  document.getElementById('upload-popup-no').remove();
  document.getElementById('upload-popup-yes').remove();
  
  closeUploadPopup();
}

/****************************************************************************************************/