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
  });
});