if(document.getElementById('openServiceLabelModificationPopup')) document.getElementById('openServiceLabelModificationPopup').addEventListener('click', openLabelModificationPopup);

/****************************************************************************************************/

function openLabelModificationPopup(event)
{
  if(!document.getElementById('serviceLabelModificationPopup'))
  {
    var background    = document.createElement('div');
    var popup         = document.createElement('div');
    var title         = document.createElement('div');
    var content       = document.createElement('div');
    var loading       = document.createElement('div');

    background        .setAttribute('id', 'serviceModificationBackground');
    popup             .setAttribute('id', 'serviceModificationPopup');
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
        var xhr = new XMLHttpRequest();
    
        xhr.timeout = 10000;
        xhr.responseType = 'json';

        xhr.open('GET', '/queries/storage/strings', true);

        xhr.send(null);

        xhr.ontimeout = () =>
        {
          $(loading).fadeOut(250, () =>
          {
            loading.remove();

            displayPopupError('La requête a expiré, veuillez réessayer plus tard', null);
          });
        }

        xhr.onload = () =>
        {
          $(loading).fadeOut(250, () =>
          {
            loading.remove();

            if(xhr.status == 200)
            {
              title.innerText = xhr.response.strings.admin.services.modify.serviceLabel;

              var currentLabel      = document.createElement('div');
              var currentInput      = document.createElement('div');
              var newLabel          = document.createElement('div');
              var newInput          = document.createElement('input');
              var checkIcon         = document.createElement('div');
              var confirmButton     = document.createElement('button');
              var cancelButton      = document.createElement('button');

              newInput              .setAttribute('id', 'serviceModificationPopupContentInput');
              checkIcon             .setAttribute('id', 'serviceModificationPopupContentInputCheck');
              confirmButton         .setAttribute('id', 'serviceModificationPopupContentConfirm');

              currentLabel          .setAttribute('class', 'serviceModificationPopupContentLabel');
              newLabel              .setAttribute('class', 'serviceModificationPopupContentLabel');
              currentInput          .setAttribute('class', 'serviceModificationPopupContentValue');
              newInput              .setAttribute('class', 'serviceModificationPopupContentInput');
              checkIcon             .setAttribute('class', 'serviceModificationPopupContentInputFalse');
              confirmButton         .setAttribute('class', 'serviceModificationPopupContentConfirmInactive');
              cancelButton          .setAttribute('class', 'serviceModificationPopupContentCancel');

              cancelButton          .addEventListener('click', closeModifyPopup);

              newInput              .addEventListener('change', () => { checkLabelValue(newInput.value); });

              newInput              .addEventListener('focus', () => { displayHint(); });

              newInput              .addEventListener('focusout', () => { removeHint(); });

              newInput              .setAttribute('type', 'text');
              newInput              .setAttribute('placeholder', xhr.response.strings.admin.services.modify.popup.newLabelPlaceholder);

              currentLabel          .innerText = xhr.response.strings.admin.services.modify.popup.currentLabel;
              newLabel              .innerText = xhr.response.strings.admin.services.modify.popup.newLabel;
              confirmButton         .innerHTML = xhr.response.strings.admin.services.modify.popup.confirmButton;
              cancelButton          .innerHTML = xhr.response.strings.admin.services.modify.popup.cancelButton;

              checkIcon             .innerHTML = `<i class="fas fa-times"></i>`;

              checkIcon             .setAttribute('title', `Valeur incorrecte`);

              currentInput          .innerText = document.getElementById('serviceLabel').innerText;

              content               .appendChild(currentLabel);
              content               .appendChild(currentInput);
              content               .appendChild(newLabel);
              content               .appendChild(newInput);
              content               .appendChild(confirmButton);
              content               .appendChild(cancelButton);

              $(checkIcon)          .hide().insertAfter(newInput);

              newInput              .style.border = '1px solid #EA645F';

              $(checkIcon)          .fadeIn(500);
            }

            else
            {
              displayPopupError(xhr.response.message, xhr.response.detail);
            }
          });
        }
      }); 
    });
  }
}

/****************************************************************************************************/

function checkLabelValue(value)
{
  document.getElementById('serviceModificationPopupContentInput').style.border = '1px solid #E0E0E0';

  $(document.getElementById('serviceModificationPopupContentInputCheck')).fadeOut(250, () =>
  {
    if(new RegExp('^[a-zA-Zàéèäëïöüâêîôû][a-zA-Zàéèäëïöüâêîôû0-9]*(( )?[a-zA-Zàéèäëïöüâêîôû0-9]+)*$').test(value))
    {
      document.getElementById('serviceModificationPopupContentInput').style.border = '1px solid #5CB85C';

      document.getElementById('serviceModificationPopupContentInputCheck').setAttribute('title', 'Valeur correcte');
      document.getElementById('serviceModificationPopupContentInputCheck').style.color = '#5CB85C';
      document.getElementById('serviceModificationPopupContentInputCheck').innerHTML = `<i class="fas fa-check"></i>`;
      $(document.getElementById('serviceModificationPopupContentInputCheck')).fadeIn(250);

      if(document.getElementById('serviceModificationPopupContentConfirm').getAttribute('class') == 'serviceModificationPopupContentConfirmInactive')
      {
        document.getElementById('serviceModificationPopupContentConfirm').setAttribute('class', 'serviceModificationPopupContentConfirmActive');

        document.getElementById('serviceModificationPopupContentConfirm').addEventListener('click', sendNewServiceLabel);
      }
    }

    else
    {
      document.getElementById('serviceModificationPopupContentInput').style.border = '1px solid #D9534F';

      document.getElementById('serviceModificationPopupContentInputCheck').setAttribute('title', 'Valeur incorrecte');
      document.getElementById('serviceModificationPopupContentInputCheck').style.color = '#D9534F';
      document.getElementById('serviceModificationPopupContentInputCheck').innerHTML = `<i class="fas fa-times"></i>`;
      $(document.getElementById('serviceModificationPopupContentInputCheck')).fadeIn(250);

      document.getElementById('serviceModificationPopupContentConfirm').removeEventListener('click', sendNewServiceLabel);

      document.getElementById('serviceModificationPopupContentConfirm').setAttribute('class', 'serviceModificationPopupContentConfirmInactive');
    }
  });
}

/****************************************************************************************************/

function displayHint()
{
  var hint            = document.createElement('div');
  
  hint                .innerHTML = '- Caractères spéciaux interdits</br>- Ne doit pas commencer par un chiffre';

  hint                .setAttribute('id', 'serviceModificationPopupContentHint');
  hint                .setAttribute('class', 'serviceModificationPopupContentHint');

  $(hint).hide().appendTo(document.getElementById('serviceModificationPopupContent'));

  $(hint).fadeIn(250);
}

/****************************************************************************************************/

function removeHint()
{
  if(document.getElementById('serviceModificationPopupContentHint'))
  {
    $(document.getElementById('serviceModificationPopupContentHint')).fadeOut(250, () => { document.getElementById('serviceModificationPopupContentHint').remove(); });
  }
}

/****************************************************************************************************/

function sendNewServiceLabel()
{
  var value = document.getElementById('serviceModificationPopupContentInput').value;

  $(document.getElementById('serviceModificationPopupContent')).slideUp(500, () =>
  {
    document.getElementById('serviceModificationPopupContent').innerHTML = '';

    var loading       = document.createElement('div');
    loading           .setAttribute('class', 'serviceModificationPopupContentLoading');
    loading           .innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    document.getElementById('serviceModificationPopupContent').appendChild(loading);

    $(document.getElementById('serviceModificationPopupContent')).slideDown(500, () =>
    {
      $.ajax(
      {
        method: 'POST',
        dataType: 'json',
        timeout: 10000,
        url: '/queries/storage/services/modify-service-label',
        data: { serviceLabel: value, serviceID: document.getElementById('serviceName').innerText },

        error: (xhr, textStatus, errorThrown) =>
        {
          if(textStatus == 'timeout') displayPopupError('La requête a expiré, veuillez réessayer plus tard', null);

          else if(textStatus == 'parsererror') displayPopupError('Erreur critique, veuillez la signaler au plus vite', null)
          
          else
          {
            displayPopupError(xhr.responseJSON.message, xhr.responseJSON.detail);
          }
        }

      }).done((json) =>
      {
        displayPopupSuccess(json.message, json.detail);

        socket.emit('storageAppAdminServiceLabelUpdated', document.getElementById('serviceDetailBlock').getAttribute('name'), value);
      });
    });
  });
}

/****************************************************************************************************/