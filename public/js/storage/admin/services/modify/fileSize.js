/****************************************************************************************************/

if(document.getElementById('openServiceMaxFileSizeModificationPopup')) document.getElementById('openServiceMaxFileSizeModificationPopup').addEventListener('click', openFileSizeModificationPopup);

/****************************************************************************************************/

function openFileSizeModificationPopup()
{
  if(!document.getElementById('serviceMaxFileSizeModificationPopup'))
  {
    var background    = document.createElement('div');
    var popup         = document.createElement('div');
    var title         = document.createElement('div');
    var content       = document.createElement('div');
    var loading       = document.createElement('div');

    background        .setAttribute('id', 'serviceModificationBackground');
    popup             .setAttribute('id', 'serviceMaxFileSizeModificationPopup');
    content           .setAttribute('id', 'serviceModificationPopupContent');

    background        .setAttribute('class', 'serviceModificationBackground');
    popup             .setAttribute('class', 'serviceModificationPopup');
    title             .setAttribute('class', 'serviceModificationPopupTitle');
    content           .setAttribute('class', 'serviceModificationPopupContent');
    loading           .setAttribute('class', 'serviceModificationPopupContentLoading');

    title             .innerText = '...';
    loading           .innerHTML = `<i class='fas fa-circle-notch fa-spin'></i>`;

    content           .appendChild(loading);

    popup             .appendChild(title);
    popup             .appendChild(content);

    $(background)     .hide().appendTo(document.body);
    $(popup)          .hide().appendTo(document.body);

    $(background).fadeIn(250, () => 
    { 
      $(popup).fadeIn(500, () => 
      {
        $.ajax(
        {
          type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/storage/strings', success: () => {},
          error: (xhr, status, error) =>
          {
            if(xhr.responseJSON == undefined)
            {
              displayPopupError('La requête a expiré, veuillez réessayer plus tard', null);
            }
  
            else
            {
              displayPopupError(xhr.responseJSON.message, xhr.responseJSON.detail);
            }
          }
                          
        }).done((json) =>
        {
          var strings = json.strings;

          $.ajax(
          {
            type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/storage/admin/get-min-and-max-file-size', success: () => {},
            error: (xhr, status, error) =>
            {
              if(xhr.responseJSON == undefined)
              {
                displayPopupError('La requête a expiré, veuillez réessayer plus tard', null);
              }
    
              else
              {
                displayPopupError(xhr.responseJSON.message, xhr.responseJSON.detail);
              }
            }
                            
          }).done((json) =>
          {
            var minFileSize = '', maxFileSize = '';

            if(Math.floor(json.minSize / 1024 / 1024 / 1024) >= 1) minFileSize = (json.minSize / 1024 / 1024 / 1024).toFixed(2) + 'Go';
            else if(Math.floor(json.minSize / 1024 / 1024) >= 1) minFileSize = (json.minSize / 1024 / 1024).toFixed(2) + 'Mo';
            else if(Math.floor(json.minSize / 1024) >= 1) minFileSize = (json.minSize / 1024).toFixed(2) + 'Ko';
            else{ minFileSize = json.minSize + 'o'; }

            if(Math.floor(json.maxSize / 1024 / 1024 / 1024) >= 1) maxFileSize = (json.maxSize / 1024 / 1024 / 1024).toFixed(2) + 'Go';
            else if(Math.floor(json.maxSize / 1024 / 1024) >= 1) maxFileSize = (json.maxSize / 1024 / 1024).toFixed(2) + 'Mo';
            else if(Math.floor(json.maxSize / 1024) >= 1) maxFileSize = (json.maxSize / 1024).toFixed(2) + 'Ko';
            else{ maxFileSize = json.maxSize + 'o'; }

            loading.remove();

            title                 .innerText = strings.admin.services.modify.maxFileSize;

            var valueLabel        = document.createElement('div');
            var confirmButton     = document.createElement('div');
            var cancelButton      = document.createElement('div');
            var valueInput        = document.createElement('input');
            var inputHelp         = document.createElement('div');
            var valueSelect       = document.createElement('select');

            cancelButton          .addEventListener('click', closeModifyPopup);

            valueInput            .setAttribute('type', 'number');

            valueInput            .addEventListener('focusout', () => checkFileSize(valueInput.value, valueSelect.value, strings));
            valueInput            .addEventListener('focus', () => { $(inputHelp).fadeIn(250); });
            valueInput            .addEventListener('focusout', () => { $(inputHelp).fadeOut(250); });
            valueSelect           .addEventListener('change', () => checkFileSize(valueInput.value, valueSelect.value, strings));

            inputHelp             .style.display = 'none';

            inputHelp             .innerHTML = '<div>- ' + strings.admin.services.modify.minFileSize + ' : ' + minFileSize + '</div><div>- ' + strings.admin.services.modify.maxFileSize + ' : ' + maxFileSize + '</div>';

            valueLabel            .setAttribute('class', 'serviceModificationPopupContentLabel');
            valueInput            .setAttribute('class', 'serviceModificationPopupContentFileSizeInput');
            valueSelect           .setAttribute('class', 'serviceModificationPopupContentFileSizeSelect');
            inputHelp             .setAttribute('class', 'serviceModificationPopupContentFileSizeInputHelp');

            valueInput            .setAttribute('id', 'serviceModificationPopupContentFileSizeInput');
            valueSelect           .setAttribute('id', 'serviceModificationPopupContentFileSizeSelect');
            confirmButton         .setAttribute('id', 'serviceModificationPopupContentFileSizeConfirm');

            confirmButton         .setAttribute('class', 'serviceModificationPopupContentFileSizeConfirmInactive');
            cancelButton          .setAttribute('class', 'serviceModificationPopupContentFileSizeCancel');

            cancelButton          .setAttribute('title', strings.admin.services.modify.popup.cancelButton);
            confirmButton         .setAttribute('title', strings.admin.services.modify.popup.inactiveConfirmation);

            valueLabel            .innerText = strings.admin.services.modify.popup.newSize;

            valueSelect           .innerHTML = '<option value="1024">Ko</option><option value="1048576">Mo</option><option value="1073741824">Go</option>';

            confirmButton         .innerHTML = '<i class="fas fa-check-circle"></i>';
            cancelButton          .innerHTML = '<i class="fas fa-times-circle"></i>';

            content               .appendChild(valueLabel);
            content               .appendChild(valueInput);
            content               .appendChild(valueSelect);
            content               .appendChild(confirmButton);
            content               .appendChild(cancelButton);
            content               .appendChild(inputHelp);

            document.getElementById('serviceMaxFileSizeModificationPopup').appendChild(content);
          });
        });
      });
    });
  }
}

/****************************************************************************************************/

function checkFileSize(fileSize, multiplier, strings)
{
  document.getElementById('serviceModificationPopupContentFileSizeConfirm').removeEventListener('click', sendNewSize);

  document.getElementById('serviceModificationPopupContentFileSizeConfirm').setAttribute('title', strings.admin.services.modify.popup.inactiveConfirmation);
  document.getElementById('serviceModificationPopupContentFileSizeConfirm').setAttribute('class', 'serviceModificationPopupContentFileSizeConfirmInactive');
  
  document.getElementById('serviceModificationPopupContentFileSizeInput').removeAttribute('style');
  document.getElementById('serviceModificationPopupContent').style.filter = 'blur(4px)';

  var loading         = document.createElement('div');
  loading             .setAttribute('class', 'serviceModificationPopupLoading');
  loading             .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  document.getElementById('serviceMaxFileSizeModificationPopup').appendChild(loading);

  $.ajax(
  {
    type: 'GET', timeout: 10000, dataType: 'JSON', url: '/queries/storage/admin/get-min-and-max-file-size', success: () => {},
    error: (xhr, status, error) =>
    {
      loading.remove();

      document.getElementById('serviceModificationPopupContent').removeAttribute('style');

      if(xhr.responseJSON == undefined)
      {
        displayPopupError('La requête a expiré, veuillez réessayer plus tard', null);
      }

      else
      {
        displayPopupError(xhr.responseJSON.message, xhr.responseJSON.detail);
      }
    }
                    
  }).done((json) =>
  {
    loading.remove();

    document.getElementById('serviceModificationPopupContent').removeAttribute('style');

    if(fileSize * multiplier < json.minSize)
    {
      document.getElementById('serviceModificationPopupContentFileSizeInput').style.border = '1px solid #D9534F';
    }

    else if(fileSize * multiplier > json.maxSize)
    {
      document.getElementById('serviceModificationPopupContentFileSizeInput').style.border = '1px solid #D9534F';
    }

    else
    {
      document.getElementById('serviceModificationPopupContentFileSizeInput').style.border = '1px solid #5CB85C';

      document.getElementById('serviceModificationPopupContentFileSizeConfirm').setAttribute('title', strings.admin.services.modify.popup.activeConfirmation);
      document.getElementById('serviceModificationPopupContentFileSizeConfirm').setAttribute('class', 'serviceModificationPopupContentFileSizeConfirmActive');
      document.getElementById('serviceModificationPopupContentFileSizeConfirm').addEventListener('click', sendNewSize);
    }
  });
}

/****************************************************************************************************/

function sendNewSize()
{
  var fileSize = document.getElementById('serviceModificationPopupContentFileSizeInput').value * document.getElementById('serviceModificationPopupContentFileSizeSelect').value;

  document.getElementById('serviceModificationPopupContent').style.filter = 'blur(4px)';

  var loading         = document.createElement('div');
  loading             .setAttribute('class', 'serviceModificationPopupLoading');
  loading             .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

  document.getElementById('serviceMaxFileSizeModificationPopup').appendChild(loading);

  $.ajax(
  {
    type: 'POST', timeout: 10000, dataType: 'JSON', data: { fileSize: fileSize, serviceName: document.getElementById('serviceDetailBlock').getAttribute('name') }, url: '/queries/storage/admin/update-service-max-file-size', success: () => {},
    error: (xhr, status, error) =>
    {
      document.getElementById('serviceModificationPopupContent').removeAttribute('style');

      loading.remove();

      if(xhr.responseJSON == undefined)
      {
        displayPopupError('La requête a expiré, veuillez réessayer plus tard', null);
      }

      else
      {
        displayPopupError(xhr.responseJSON.message, xhr.responseJSON.detail);
      }
    }
                    
  }).done((json) =>
  {
    loading.remove();

    document.getElementById('serviceModificationPopupContent').removeAttribute('style');

    displayPopupSuccess(json.message, null);

    socket.emit('storageAppAdminServiceFileSizeUpdated', document.getElementById('serviceDetailBlock').getAttribute('name'), fileSize);
  });
}

/****************************************************************************************************/