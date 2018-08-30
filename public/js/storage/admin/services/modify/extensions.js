/****************************************************************************************************/

if(document.getElementById('serviceDetailBlockExtensionsSave')) document.getElementById('serviceDetailBlockExtensionsSave').addEventListener('click', saveServiceExtensions);

/****************************************************************************************************/

function saveServiceExtensions(event)
{
  if(document.getElementById('serviceDetailBlockExtensionsElements'))
  {
    var background    = document.createElement('div');
    var spinner       = document.createElement('div');

    background        .setAttribute('class', 'storageBackground');
    spinner           .setAttribute('class', 'storageSpinner');

    spinner           .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    document.body     .appendChild(background);
    document.body     .appendChild(spinner);

    var extensionValues = [];

    var extensionBlocks = document.getElementById('serviceDetailBlockExtensionsElements').children;

    for(var x = 0; x < extensionBlocks.length; x++)
    {
      if(extensionBlocks[x].children[0].checked) extensionValues.push(extensionBlocks[x].getAttribute('name'));
    }

    $.ajax(
    {
      type: 'PUT', timeout: 5000, dataType: 'JSON', data: { extensionValues: JSON.stringify(extensionValues), serviceUuid: document.getElementById('serviceDetailBlock').getAttribute('name') }, url: '/queries/storage/admin/update-service-extensions', success: () => {},
      error: (xhr, status, error) =>
      {
        background.remove();
        spinner.remove();

        if(xhr.responseJSON == undefined)
        {
          displayErrorMessage('La requête a expiré, veuillez réessayer plus tard', null);
        }
  
        else
        {
          displayErrorMessage(xhr.responseJSON.message, xhr.responseJSON.detail);
        }
      }

    }).done((json) =>
    {
      background.remove();
      spinner.remove();

      socket.emit('storageAppAdminServiceExtensionsUpdated', document.getElementById('serviceDetailBlock').getAttribute('name'));
    });
  }
}

/****************************************************************************************************/