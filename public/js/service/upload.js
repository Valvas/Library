window.onload = $(function()
{
  
  $('body').on('click', '#service-main-block-file-buttons-upload', function()
  {
    $.ajax(
    {
      type: 'PUT', timeout: 2000, dataType: 'JSON', data: { service: $(document.getElementById('service-main-block')).attr('name') }, url: '/service/get-ext-accepted', success: function(){},
      error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                    
    }).done(function(json)
    {
      let array = Object.values(json);
      
      openUploadFilePopup(
      {
        title: 'ENVOYER UN FICHIER',
        message: 'Choisissez un fichier sur votre appareil à envoyer sur le serveur.',
        perform: 'Envoyer'
      }, array);
    });

    /****************************************************************************************************/

    $('body').on('click', '#upload-popup-close', function(event)
    {
      if(document.getElementById('upload-popup')) $(document.getElementById('upload-popup')).remove();
      if(document.getElementById('veil')) $(document.getElementById('veil')).remove();
    });

    /****************************************************************************************************/

    $('body').on('click', '#upload-popup-perform-button', function(event)
    {      
      var data = new FormData();

      data.append('service', $(document.getElementById('service-main-block')).attr('name'));
      data.append('file', $('#upload-popup-input')[0]['files'][0], $('#upload-popup-input')[0]['files'][0].name);

      $.ajax(
      {
        type: 'POST', timeout: 2000, data: data, processData: false, contentType: false, url: '/service/post-new-file', success: function(){},
        error: function(xhr, status, error){ printError(`ERROR [${xhr['status']}] - ${error} !`); }
                    
      }).done(function(result)
      {
        if(result == false)
        {
          $('#upload-popup-input').css('border', '1px solid red');
          $(`<div id='upload-popup-error-message' class='popup-error-message'>Un fichier du même nom existe déjà.</div>`).appendTo('#upload-popup').insertBefore('#upload-popup-perform-button');
        }

        else
        {
          $('body').off('click', '#upload-popup-perform-button');

          updateFilesList($(document.getElementById('service-main-block')).attr('name'), function()
          {
            $('#upload-popup').remove();
            $('#veil').remove();
    
            printSuccess('Fichier envoyé.');
          });
        }
      });
    });

    /****************************************************************************************************/

    $('body').on('click', '#upload-popup-input', function()
    {
      $('#upload-popup-input').css('border', '1px solid black');
      $('#upload-popup-error-message').remove();
    });

    /****************************************************************************************************/
  });
});