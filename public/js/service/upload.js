window.onload = $(() =>
{
  var socket = io();
  
  $('body').on('click', '#service-main-block-file-buttons-upload', () =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: $(document.getElementById('service-main-block')).attr('name') }, url: '/service/get-ext-accepted', success: function(){},
      error: (xhr, status, error) => { printError(`ERROR [${xhr['status']}] - ${error} !`); }
                    
    }).done((json) =>
    {
      json.result == false ? printError('Une requête vers le serveur a échoué') :

      openUploadFilePopup(
      {
        title: 'ENVOYER UN FICHIER',
        message: 'Choisissez un fichier sur votre appareil à envoyer sur le serveur.',
        perform: 'Envoyer'
      }, Object.values(json.ext));
    });
  });

  /****************************************************************************************************/

  $('body').on('click', '#upload-popup-close', (event) =>
  {
    if(document.getElementById('upload-popup')) $(document.getElementById('upload-popup')).remove();
    if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
  });

  /****************************************************************************************************/

  $('body').on('click', '#upload-popup-perform-button', (event) =>
  {
    $('#upload-popup-input')[0]['files'][0] == undefined ? $('#upload-popup-input').css('border', '1px solid red') :

    $.ajax(
    {
      type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: $(document.getElementById('service-main-block')).attr('name') }, url: '/service/get-ext-accepted', success: function(){},
      error: (xhr, status, error) => { printError(`ERROR [${xhr['status']}] - ${error} !`); }
                      
    }).done((json) =>
    {
      if(json.result == false) printError('Une requête vers le serveur a échoué');

      else
      {
        if($('#upload-popup-input')[0]['files'][0]['name'].split('.').length < 2)
        {
          $('#upload-popup-input').css('border', '1px solid red');
          $(`<div id='upload-popup-error-message' class='popup-error-message'>Ce type de fichier n'est pas accepté</div>`).appendTo('#upload-popup').insertBefore('#upload-popup-perform-button');
        }

        else
        {
          if(Object.values(json.ext).includes($('#upload-popup-input')[0]['files'][0]['name'].split('.')[1]) == false)
          {
            $('#upload-popup-input').css('border', '1px solid red');
            $(`<div id='upload-popup-error-message' class='popup-error-message'>Ce type de fichier n'est pas accepté</div>`).appendTo('#upload-popup').insertBefore('#upload-popup-perform-button');
          }

          else
          {
            var data = new FormData();
            
            data.append('service', $(document.getElementById('service-main-block')).attr('name'));
            data.append('file', $('#upload-popup-input')[0]['files'][0], $('#upload-popup-input')[0]['files'][0].name);
            
            $.ajax(
            {
              type: 'POST', timeout: 2000, data: data, processData: false, contentType: false, url: '/service/post-new-file', success: () => {},
              error: (xhr, status, error) => { printError(xhr.responseJSON.message); }
                                
            }).done((json) =>
            {
              socket.emit('from_service_upload', { 'room': $(document.getElementById('service-main-block')).attr('name') });
              socket.emit('from_file_upload', { 'room': json.fileUUID, logID: json.log });
            
              $('#upload-popup').remove();
              $('#veil').remove();
                
              printSuccess('Fichier envoyé.');
            });
          }
        }
      }
    });
  });

  /****************************************************************************************************/

  $('body').on('click', '#upload-popup-input', () =>
  {
    $('#upload-popup-input').css('border', '1px solid black');
    $('#upload-popup-error-message').remove();
  });

  /****************************************************************************************************/
});