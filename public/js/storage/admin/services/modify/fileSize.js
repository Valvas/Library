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
              title                 .innerText = xhr.response.strings.admin.services.modify.serviceFileSizeLimit;

              content               .style.display = 'none';

              var valueLabel        = document.createElement('div');
              var valueInput        = document.createElement('div');
              var valueSelect       = document.createElement('div');
              var confirmButton     = document.createElement('button');
              var cancelButton      = document.createElement('button');

              content               .appendChild(valueLabel);
              content               .appendChild(valueInput);
              content               .appendChild(valueSelect);
              content               .appendChild(confirmButton);
              content               .appendChild(cancelButton);
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