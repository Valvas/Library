/****************************************************************************************************/

if(document.getElementById('initForm')) document.getElementById('initForm').addEventListener('submit', checkForm);

/****************************************************************************************************/

function checkForm(event)
{
  event.preventDefault();

  var errorMessages = document.getElementsByClassName('initFormBlockSectionError');

  for(var x = 0; x < errorMessages.length; x++) errorMessages[x].removeAttribute('style');

  if(document.getElementById('databaseHost') == null) return;
  if(document.getElementById('databasePort') == null) return;
  if(document.getElementById('databaseUser') == null) return;
  if(document.getElementById('databasePass') == null) return;
  if(document.getElementById('databaseDbms') == null) return;

  if(document.getElementById('storagePath') == null) return;

  if(document.getElementById('transporterHost') == null) return;
  if(document.getElementById('transporterPort') == null) return;
  if(document.getElementById('transporterUser') == null) return;
  if(document.getElementById('transporterPass') == null) return;
  if(document.getElementById('transporterSecure') == null) return;

  if(document.getElementById('otherLogout') == null) return;
  if(document.getElementById('otherPort') == null) return;
  if(document.getElementById('otherSalt') == null) return;

  /****************************************************************************************************/
  // DATABASE
  /****************************************************************************************************/

  if(new RegExp("^((2[0-5][0-5]|[0-1]?[0-9]?[0-9])\.){3}(2[0-5][0-5]|[0-1]?[0-9]?[0-9])$|^([a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)*$").test(document.getElementById('databaseHost').value) == false)
  {
    document.getElementById('databaseHostError').style.display = 'block';

    return;
  }

  if(new RegExp("^[1-9][0-9]*$").test(document.getElementById('databasePort').value) == false)
  {
    document.getElementById('databasePortError').style.display = 'block';

    return;
  }

  if(document.getElementById('databaseUser').value.length === 0)
  {
    document.getElementById('databaseUserError').style.display = 'block';

    return;
  }

  if(document.getElementById('databasePass').value.length === 0)
  {
    document.getElementById('databasePassError').style.display = 'block';

    return;
  }

  /****************************************************************************************************/
  // STORAGE
  /****************************************************************************************************/

  if(document.getElementById('storagePath').value.length === 0)
  {
    document.getElementById('storagePathError').style.display = 'block';

    return;
  }

  /****************************************************************************************************/
  // TRANSPORTER
  /****************************************************************************************************/

  if(new RegExp("^((2[0-5][0-5]|[0-1]?[0-9]?[0-9])\.){3}(2[0-5][0-5]|[0-1]?[0-9]?[0-9])$|^([a-zA-Z0-9]+)(\.[a-zA-Z0-9]+)*$").test(document.getElementById('transporterHost').value) == false)
  {
    document.getElementById('transporterHostError').style.display = 'block';

    return;
  }

  if(new RegExp("^[1-9][0-9]*$").test(document.getElementById('transporterPort').value) == false)
  {
    document.getElementById('transporterPortError').style.display = 'block';

    return;
  }

  if(document.getElementById('transporterUser').value.length === 0)
  {
    document.getElementById('transporterUserError').style.display = 'block';

    return;
  }

  if(document.getElementById('transporterPass').value.length === 0)
  {
    document.getElementById('transporterPassError').style.display = 'block';

    return;
  }

  /****************************************************************************************************/
  // OTHER
  /****************************************************************************************************/

  if(document.getElementById('otherLogout').value < 0 || document.getElementById('otherLogout').value > 60)
  {
    document.getElementById('otherLogoutError').style.display = 'block';

    return;
  }

  if(new RegExp("^[1-9][0-9]*$").test(document.getElementById('otherPort').value) == false)
  {
    document.getElementById('otherPortError').style.display = 'block';

    return;
  }

  /****************************************************************************************************/

  if(document.getElementById('databaseHost') == null) return;
  if(document.getElementById('databasePort') == null) return;
  if(document.getElementById('databaseUser') == null) return;
  if(document.getElementById('databasePass') == null) return;
  if(document.getElementById('databaseDbms') == null) return;

  if(document.getElementById('storagePath') == null) return;

  if(document.getElementById('transporterHost') == null) return;
  if(document.getElementById('transporterPort') == null) return;
  if(document.getElementById('transporterUser') == null) return;
  if(document.getElementById('transporterPass') == null) return;
  if(document.getElementById('transporterSecure') == null) return;

  if(document.getElementById('otherLogout') == null) return;
  if(document.getElementById('otherPort') == null) return;
  if(document.getElementById('otherSalt') == null) return;

  var formData = {};

  formData.other = {};
  formData.storage = {};
  formData.database = {};
  formData.transporter = {};

  formData.database.port        = document.getElementById('databasePort').value;
  formData.database.user        = document.getElementById('databaseUser').value;
  formData.database.host        = document.getElementById('databaseHost').value;
  formData.database.manager     = document.getElementById('databaseDbms').value;
  formData.database.password    = document.getElementById('databasePass').value;

  formData.storage.root         = document.getElementById('storagePath').value;

  formData.transporter.port     = document.getElementById('transporterPort').value;
  formData.transporter.user     = document.getElementById('transporterUser').value;
  formData.transporter.address  = document.getElementById('transporterHost').value;
  formData.transporter.password = document.getElementById('transporterPass').value;
  formData.transporter.secure   = document.getElementById('transporterSecure').value;

  formData.other.port           = document.getElementById('otherPort').value;
  formData.other.salt           = document.getElementById('otherSalt').value;
  formData.other.timeout        = document.getElementById('otherLogout').value;

  createBackground('initFormBackground');

  displayLoader('', (loader) =>
  {
    $.ajax(
    {
      type: 'PUT', timeout: 5000, processData: false, data: JSON.stringify(formData), contentType: 'application/json; charset=utf-8', dataType: 'JSON', url: '/init/form', success: () => {},
      error: (xhr, status, error) =>
      {
        removeBackground('initFormBackground');

        removeLoader(loader, () =>
        {
          xhr.responseJSON != undefined
          ? displayError(xhr.responseJSON.message, xhr.responseJSON.detail, null)
          : displayError('Une erreur est survenue, veuillez réessayer plus tard', null, null);
        });
      }
                      
    }).done((json) => 
    {
      location = '/init/test';
    });
  });
}