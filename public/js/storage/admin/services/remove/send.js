/****************************************************************************************************/

function sendRemoveServiceRequest(serviceUUID)
{
  closeRemovePopup();

  displayLoadingVeil();

  $.ajax(
  {
    type: 'POST', timeout: 5000, dataType: 'JSON', data: { service: serviceUUID }, url: '/queries/storage/services/remove-service',
    error: (xhr, status, error) => 
    {
      removeLoadingVeil();

      if(status == 'timeout')
      {
        printError('Le serveur a mis trop de temps à répondre', 'Celui-ci est peut-être injoignable pour le moment');
      }

      else
      {
        printError(xhr.responseJSON.message, xhr.responseJSON.detail);
      }
    }
                
  }).done((json) =>
  {
    removeLoadingVeil();

    printSuccess(json.message, null);

    socket.emit('storageAppAdminServiceRemoved', serviceUUID);
  });
}

/****************************************************************************************************/