function checkDataForm()
{
  var checkFilledFields = true;
  
  /*****************************************************************************************************
  DATABASE
  *****************************************************************************************************/

  if(document.getElementById('database-address').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('database-address-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('database-address').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('database-address-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('database-address-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('database-port').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('database-port-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('database-port').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('database-port-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('database-port-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('database-user').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('database-user-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('database-user').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('database-user-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('database-user-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('database-password').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('database-password-error').innerText = 'Veuillez renseigner ce champ';
  }

  else{ document.getElementById('database-password-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('database-name').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('database-name-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('database-name').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('database-name-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('database-name-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('database-manager').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('database-manager-error').innerText = 'Veuillez renseigner ce champ';
  }

  else{ document.getElementById('database-manager-error').innerText = ''; }

  /*****************************************************************************************************
  STORAGE
  *****************************************************************************************************/

  if(document.getElementById('storage-root').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('storage-root-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('storage-root').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('storage-root-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('storage-root-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('storage-size').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('storage-size-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('storage-size').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('storage-size-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('storage-size-error').innerText = ''; }

  /*****************************************************************************************************
  EMAIL
  *****************************************************************************************************/

  if(document.getElementById('transporter-address').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('transporter-address-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('transporter-address').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('transporter-address-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('transporter-address-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('transporter-port').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('transporter-port-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('transporter-port').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('transporter-port-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('transporter-port-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('transporter-user').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('transporter-user-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('transporter-user').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('transporter-user-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('transporter-user-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('transporter-password').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('transporter-password-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('transporter-password').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('transporter-password-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('transporter-password-error').innerText = ''; }

  /*****************************************************************************************************
  OTHER
  *****************************************************************************************************/

  if(document.getElementById('other-timeout').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('other-timeout-error').innerText = 'Veuillez renseigner ce champ';
  }

  else if(document.getElementById('other-timeout').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('other-timeout-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('other-timeout-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('other-salt').value.length == 0)
  {
    checkFilledFields = false;
    document.getElementById('other-salt-error').innerText = 'Veuillez renseigner ce champ';
  }

  else{ document.getElementById('other-salt-error').innerText = ''; }

  /****************************************************************************************************/

  if(document.getElementById('other-port').value.match(/\s/) != null)
  {
    checkFilledFields = false;
    document.getElementById('other-port-error').innerText = 'Espaces non-autorisés';
  }

  else{ document.getElementById('other-port-error').innerText = ''; }

  /****************************************************************************************************/
  /****************************************************************************************************/

  if(checkFilledFields == false)
  {
    document.getElementById('logs').removeAttribute('style');

    setTimeout(() => { document.getElementById('logs').style.display = 'none'; }, 3000);
  }

  else
  {
    var dataObject = {};

    dataObject.other = {};
    dataObject.storage = {};
    dataObject.database = {};
    dataObject.transporter = {};

    dataObject.database.port        = document.getElementById('database-port').value;
    dataObject.database.user        = document.getElementById('database-user').value;
    dataObject.database.name        = document.getElementById('database-name').value;
    dataObject.database.address     = document.getElementById('database-address').value;
    dataObject.database.manager     = document.getElementById('database-manager').value;
    dataObject.database.password    = document.getElementById('database-password').value;

    dataObject.storage.root         = document.getElementById('storage-root').value;
    dataObject.storage.size         = document.getElementById('storage-size').value;

    dataObject.transporter.port     = document.getElementById('transporter-port').value;
    dataObject.transporter.user     = document.getElementById('transporter-user').value;
    dataObject.transporter.address  = document.getElementById('transporter-address').value;
    dataObject.transporter.password = document.getElementById('transporter-password').value;

    dataObject.other.port           = document.getElementById('other-port').value;
    dataObject.other.salt           = document.getElementById('other-salt').value;
    dataObject.other.timeout        = document.getElementById('other-timeout').value;

    $.ajax(
    {
      type: 'POST', timeout: 2000, dataType: 'JSON', data: { dataObject: dataObject }, url: '/init/form', success: () => {},
      error: (xhr, status, error) => { console.log(xhr.responseJSON.message); }
                      
    }).done((json) => 
    {
      location = '/';
    });
  }

  /****************************************************************************************************/
}