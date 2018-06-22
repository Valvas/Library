/****************************************************************************************************/

if(document.getElementById('serviceCreationFormBlock')) document.getElementById('serviceCreationFormBlock').addEventListener('submit', submitForm);

if(document.getElementById('serviceCreationFormBlockName')) document.getElementById('serviceCreationFormBlockName').addEventListener('focus', () =>
{
  document.getElementById('serviceCreationFormBlockNameIncorrect').removeAttribute('style');
});

/****************************************************************************************************/

function submitForm(event)
{
  event.preventDefault();

  if(document.getElementById('serviceCreationFormBlockName').value.match(/^([A-Za-z](\s?[A-Za-z0-9])+)$/) == null)
  {
    document.getElementById('serviceCreationFormBlockNameIncorrect').style.display = 'block';
  }

  else
  {
    displayLoadingVeil();

    var service = {};

    document.getElementById('serviceCreationFormBlockNameIncorrect').removeAttribute('style');

    const serviceName = document.getElementById('serviceCreationFormBlockName').value;
    const maxFileSizeQuantifier = document.getElementById('serviceCreationFormBlockSizeQuantifier').options[document.getElementById('serviceCreationFormBlockSizeQuantifier').selectedIndex].value;
    const maxFileSize = (document.getElementById('serviceCreationFormBlockSizeValue').value * (Math.pow(1024, (parseInt(maxFileSizeQuantifier) + 1))));

    var authorizedExtensions = {};

    var extensions = document.getElementById('serviceCreationFormBlockExtensionsElements').children;

    for(var x = 0; x < extensions.length; x++)
    {
      if(extensions[x].children[0].checked) authorizedExtensions[x] = extensions[x].getAttribute('name');
    }

    service['serviceName'] = serviceName;
    service['maxFileSize'] = maxFileSize;
    service['authorizedExtensions'] = authorizedExtensions;
    
    $.ajax(
    {
      type: 'POST', timeout: 5000, dataType: 'JSON', data: { service: JSON.stringify(service) }, url: '/queries/storage/services/create-service',
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

      $(document.getElementById('serviceCreationFormBlock')).toggle('slide', { direction: 'up' }, 250);
    });
  }
}

/****************************************************************************************************/